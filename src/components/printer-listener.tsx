"use client";

import {
  readPrintPendingItems,
  updatePrintQueueItem,
} from "@/app/(protected)/(app)/config/printing/actions";
import { PrintQueueType } from "@/app/(protected)/(app)/config/printing/schemas";
import { createClient } from "@/lib/supabase/client";
import { usePrinterExtensionStore } from "@/stores/printerExtensionStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { PrinterExtensionStatusPoller } from "./printer-extension";

async function printQueueItem(input: PrintQueueType) {
  try {
    const response = await fetch("http://127.0.0.1:53281/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: input.text,
        raw: input.raw,
        printerName: input.printer_name,
        fontSize: input.font_size,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (input.id) {
      await updatePrintQueueItem({ id: input.id });
    }

    return { success: true, id: input.id };
  } catch (error) {
    console.error("[PrintQueueListener] Erro ao imprimir:", error);
    return { success: false, id: input.id, error };
  }
}

async function fetchAndPrintPendingItems() {
  try {
    const [data, error] = await readPrintPendingItems();

    if (error) {
      console.error(
        "[PrintQueueListener] Erro ao buscar itens pendentes:",
        error,
      );
      throw error;
    }

    if (data?.pendingItems && data.pendingItems.length > 0) {
      console.log(
        `[PrintQueueListener] Processando ${data.pendingItems.length} itens pendentes`,
      );

      // Processa todos os itens em paralelo
      const results = await Promise.allSettled(
        data.pendingItems.map((item) =>
          printQueueItem({
            id: item.id,
            printer_name: item.printer_name,
            text: item.text,
            raw: item.raw,
            font_size: item.font_size,
          }),
        ),
      );

      // Log de falhas
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `[PrintQueueListener] Falha ao imprimir item ${data.pendingItems[index].id}:`,
            result.reason,
          );
        }
      });
    }

    return data?.pendingItems ?? [];
  } catch (error) {
    console.error("[PrintQueueListener] Erro ao processar fila:", error);
    throw error;
  }
}

export default function PrintQueueListener() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { isActive } = usePrinterExtensionStore();
  const wasActive = useRef(false);
  const isProcessing = useRef(false);

  // Query para buscar e processar itens pendentes
  const { refetch } = useQuery({
    queryKey: ["print-queue-pending"],
    queryFn: fetchAndPrintPendingItems,
    enabled: isActive,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
  });

  // Listener do Supabase Realtime para novos itens
  useEffect(() => {
    if (!isActive) return;

    const channel = supabase
      .channel("print_queue_insert")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "print_queue",
        },
        async (payload) => {
          // Evita processar múltiplos eventos ao mesmo tempo
          if (isProcessing.current) {
            console.log(
              "[PrintQueueListener] Já está processando, aguardando...",
            );
            // Agenda um refetch para pegar este e outros possíveis pendentes
            setTimeout(() => refetch(), 1000);
            return;
          }

          isProcessing.current = true;

          try {
            const newItem = payload.new as PrintQueueType;
            console.log("[PrintQueueListener] Novo item na fila:", newItem.id);

            const result = await printQueueItem({
              id: newItem.id,
              printer_name: newItem.printer_name,
              text: newItem.text,
              raw: newItem.raw,
              font_size: newItem.font_size,
            });

            if (!result.success) {
              console.error(
                "[PrintQueueListener] Falha ao imprimir, agendando retry...",
              );
              // Se falhar, espera um pouco e tenta buscar pendentes novamente
              setTimeout(() => refetch(), 2000);
            }

            // Invalida a query para manter cache sincronizado
            queryClient.invalidateQueries({
              queryKey: ["print-queue-pending"],
            });
          } catch (error) {
            console.error(
              "[PrintQueueListener] Erro ao processar evento INSERT:",
              error,
            );
            // Em caso de erro, força refetch para tentar novamente
            setTimeout(() => refetch(), 2000);
          } finally {
            isProcessing.current = false;
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isActive, supabase, queryClient, refetch]);

  // Buscar pendentes quando a extensão volta a ficar ativa
  useEffect(() => {
    // Detecta transição de offline -> online
    if (isActive && !wasActive.current) {
      console.log(
        "[PrintQueueListener] Extensão reativada, buscando pendentes...",
      );
      // Pequeno delay para garantir que a extensão está pronta
      setTimeout(() => refetch(), 500);
    }

    wasActive.current = isActive;
  }, [isActive, refetch]);

  // Buscar pendentes ao montar o componente (garante processamento inicial)
  useEffect(() => {
    if (isActive) {
      console.log(
        "[PrintQueueListener] Componente montado, buscando pendentes...",
      );
      // Delay inicial para garantir que tudo está pronto
      const timer = setTimeout(() => refetch(), 1000);
      return () => clearTimeout(timer);
    }
  }, []); // Só executa uma vez ao montar

  return <PrinterExtensionStatusPoller />;
}
