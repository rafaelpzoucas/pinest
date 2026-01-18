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

    if (response.ok && input.id) {
      await updatePrintQueueItem({ id: input.id });
    }
  } catch (error) {
    console.error("[PrintQueueListener] Erro ao imprimir:", error);
    throw error;
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
      // Processa todos os itens em paralelo
      await Promise.allSettled(
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

  // Query para buscar e processar itens pendentes
  const { refetch } = useQuery({
    queryKey: ["print-queue-pending"],
    queryFn: fetchAndPrintPendingItems,
    enabled: isActive, // Só executa se a extensão estiver ativa
    refetchOnWindowFocus: true, // Busca ao focar na aba (resolve seu problema!)
    refetchOnMount: true,
    refetchInterval: 30000, // Polling a cada 30s como fallback
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0, // Sempre considera os dados stale para buscar novos
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
          try {
            const newItem = payload.new as PrintQueueType;
            await printQueueItem({
              id: newItem.id,
              printer_name: newItem.printer_name,
              text: newItem.text,
              raw: newItem.raw,
              font_size: newItem.font_size,
            });

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
            refetch();
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
      refetch();
    }

    wasActive.current = isActive;
  }, [isActive, refetch]);

  return <PrinterExtensionStatusPoller />;
}
