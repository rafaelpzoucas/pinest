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

// Set para rastrear itens sendo processados (evita duplicação)
const processingItems = new Set<string>();
// Set para rastrear itens já processados nesta sessão (evita reprocessamento)
const processedItems = new Set<string>();

async function printQueueItem(input: PrintQueueType) {
  // Proteção contra processamento duplicado
  if (!input.id) {
    console.warn("[PrintQueueListener] Item sem ID, ignorando");
    return;
  }

  // Verifica se já foi processado nesta sessão
  if (processedItems.has(input.id)) {
    console.log(
      `[PrintQueueListener] Item ${input.id} já foi processado nesta sessão, ignorando`,
    );
    return;
  }

  if (processingItems.has(input.id)) {
    console.log(
      `[PrintQueueListener] Item ${input.id} já está sendo processado, ignorando`,
    );
    return;
  }

  try {
    // Marca como processando
    processingItems.add(input.id);

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

    if (response.ok) {
      await updatePrintQueueItem({ id: input.id });
      // Marca como processado
      processedItems.add(input.id);
      console.log(
        `[PrintQueueListener] ✅ Item ${input.id} impresso com sucesso`,
      );
    } else {
      throw new Error(`Erro na impressão: ${response.status}`);
    }
  } catch (error) {
    console.error(
      `[PrintQueueListener] ❌ Erro ao imprimir item ${input.id}:`,
      error,
    );
    // NÃO adiciona ao processedItems em caso de erro (permite retry)
    throw error;
  } finally {
    // Remove do set após processamento (sucesso ou erro)
    processingItems.delete(input.id);
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

      // Processa itens em sequência (não em paralelo) para evitar race conditions
      for (const item of data.pendingItems) {
        try {
          await printQueueItem({
            id: item.id,
            printer_name: item.printer_name,
            text: item.text,
            raw: item.raw,
            font_size: item.font_size,
          });
        } catch (error) {
          console.error(
            `[PrintQueueListener] Erro ao processar item ${item.id}, continuando...`,
            error,
          );
          // Continua processando os próximos itens mesmo com erro
        }
      }
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
  const lastRefetchTime = useRef(0);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  // Query para buscar e processar itens pendentes
  const { refetch } = useQuery({
    queryKey: ["print-queue-pending"],
    queryFn: fetchAndPrintPendingItems,
    enabled: isActive,
    refetchOnWindowFocus: true, // ← REABILITADO com debounce
    refetchOnMount: true,
    refetchInterval: 15000, // ← REDUZIDO para 15s (era 30s)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
  });

  // Função com debounce para refetch
  const debouncedRefetch = () => {
    const now = Date.now();
    const timeSinceLastRefetch = now - lastRefetchTime.current;

    // Só permite refetch se passaram pelo menos 3 segundos (reduzido de 5s)
    if (timeSinceLastRefetch > 3000) {
      console.log("[PrintQueueListener] Executando refetch com debounce");
      lastRefetchTime.current = now;
      refetch();
    } else {
      console.log(
        `[PrintQueueListener] Refetch ignorado (última execução há ${timeSinceLastRefetch}ms)`,
      );
    }
  };

  // Listener do Supabase Realtime para novos itens
  useEffect(() => {
    if (!isActive) {
      // Limpa canal existente se a extensão foi desativada
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
      return;
    }

    // Cria novo canal se não existir
    if (!realtimeChannelRef.current) {
      console.log("[PrintQueueListener] Criando canal Realtime...");

      const channel = supabase
        .channel("print_queue_changes")
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
              console.log(
                `[PrintQueueListener] 🔔 Novo item recebido via Realtime: ${newItem.id}`,
              );

              // Processa o item diretamente (sem invalidar query)
              await printQueueItem({
                id: newItem.id,
                printer_name: newItem.printer_name,
                text: newItem.text,
                raw: newItem.raw,
                font_size: newItem.font_size,
              });

              // NÃO invalida a query aqui para evitar duplicação
              // O polling vai pegar qualquer item que falhou
            } catch (error) {
              console.error(
                "[PrintQueueListener] Erro ao processar evento INSERT:",
                error,
              );
              // Em caso de erro, agenda refetch com debounce
              setTimeout(debouncedRefetch, 2000);
            }
          },
        )
        .subscribe((status) => {
          console.log(`[PrintQueueListener] Status do Realtime: ${status}`);

          // Se perdeu conexão, busca pendentes ao reconectar
          if (status === "SUBSCRIBED") {
            console.log(
              "[PrintQueueListener] Realtime reconectado, buscando pendentes...",
            );
            setTimeout(debouncedRefetch, 1000);
          }
        });

      realtimeChannelRef.current = channel;
    }

    return () => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
    };
  }, [isActive, supabase]);

  // Buscar pendentes quando a extensão volta a ficar ativa
  useEffect(() => {
    // Detecta transição de offline -> online
    if (isActive && !wasActive.current) {
      console.log(
        "[PrintQueueListener] ⚡ Extensão reativada, buscando pendentes...",
      );
      // Limpa cache de itens processados ao reativar
      processedItems.clear();
      processingItems.clear();
      debouncedRefetch();
    }

    wasActive.current = isActive;
  }, [isActive]);

  // Listener para visibilidade da página (com debounce)
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[PrintQueueListener] 👁️ Página voltou a ficar visível");
        debouncedRefetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);

  // Listener para conexão de rede
  useEffect(() => {
    if (!isActive) return;

    const handleOnline = () => {
      console.log("[PrintQueueListener] 🌐 Conexão de rede restaurada");
      // Limpa cache ao voltar online
      processedItems.clear();
      processingItems.clear();
      debouncedRefetch();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [isActive]);

  return <PrinterExtensionStatusPoller />;
}
