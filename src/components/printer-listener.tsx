"use client";

import {
  readPrintPendingItems,
  updatePrintQueueItem,
} from "@/app/(protected)/(app)/config/printing/actions";
import { PrintQueueType } from "@/app/(protected)/(app)/config/printing/schemas";
import { createClient } from "@/lib/supabase/client";
import { usePrinterExtensionStore } from "@/stores/printerExtensionStore";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { PrinterExtensionStatusPoller } from "./printer-extension";

/* ======================================================
   CONFIG
====================================================== */

const PRINT_ENDPOINT = "http://127.0.0.1:53281/print";

const FETCH_TIMEOUT = 8_000; // 8s
const PROCESSING_TTL = 30_000; // 30s
const POLLING_INTERVAL = 10_000; // 10s
const WATCHDOG_INTERVAL = 30_000; // 30s
const WATCHDOG_MAX_IDLE = 60_000; // 1min

/* ======================================================
   STATE (in-memory)
====================================================== */

// id -> timestamp
const processingItems = new Map<string, number>();
const processedItems = new Set<string>();

/* ======================================================
   TOAST CONTROL
====================================================== */

let activeToastId: string | number | null = null;
let manualRecoverFn: (() => void) | null = null;

function showWarningToast(message: string) {
  if (activeToastId) return;

  activeToastId = toast.warning(message, {
    duration: Infinity,
    action: {
      label: "Reconectar agora",
      onClick: () => {
        console.log("[PrintQueueListener] 🔄 Reconexão manual solicitada");
        manualRecoverFn?.();
      },
    },
  });
}

function dismissWarningToast() {
  if (!activeToastId) return;
  toast.dismiss(activeToastId);
  activeToastId = null;
}

/* ======================================================
   UTILS
====================================================== */

function now() {
  return Date.now();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ======================================================
   CORE LOGIC
====================================================== */

function canProcess(id: string) {
  const startedAt = processingItems.get(id);

  if (!startedAt) return true;

  const age = now() - startedAt;

  if (age < PROCESSING_TTL) {
    console.log(
      `[PrintQueueListener] ⏳ ${id} ainda em processamento (${age}ms)`,
    );
    return false;
  }

  console.warn(
    `[PrintQueueListener] ♻️ ${id} expirou TTL (${age}ms), liberando`,
  );
  processingItems.delete(id);
  return true;
}

async function printQueueItem(input: PrintQueueType) {
  if (!input.id) return;

  if (processedItems.has(input.id)) {
    console.log(
      `[PrintQueueListener] ✅ ${input.id} já processado nesta sessão`,
    );
    return;
  }

  if (!canProcess(input.id)) return;

  processingItems.set(input.id, now());

  try {
    console.log(`[PrintQueueListener] 🖨️ Imprimindo ${input.id}`);

    const response = await fetchWithTimeout(
      PRINT_ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input.text,
          raw: input.raw,
          printerName: input.printer_name,
          fontSize: input.font_size,
        }),
      },
      FETCH_TIMEOUT,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await updatePrintQueueItem({ id: input.id });

    processedItems.add(input.id);
    dismissWarningToast();

    console.log(`[PrintQueueListener] ✅ ${input.id} impresso com sucesso`);
  } catch (error) {
    console.error(
      `[PrintQueueListener] ❌ Falha ao imprimir ${input.id}`,
      error,
    );

    showWarningToast(
      "Problema de conexão com a impressora. Tentando reconectar automaticamente.",
    );

    throw error;
  } finally {
    processingItems.delete(input.id);
  }
}

async function fetchAndProcessPending() {
  try {
    const [data, error] = await readPrintPendingItems();
    if (error) throw error;

    const items = data?.pendingItems ?? [];

    if (items.length > 0) {
      console.log(`[PrintQueueListener] 📦 ${items.length} itens pendentes`);
    }

    for (const item of items) {
      try {
        await printQueueItem({
          id: item.id,
          printer_name: item.printer_name,
          text: item.text,
          raw: item.raw,
          font_size: item.font_size,
        });

        await sleep(200);
      } catch {
        // continua
      }
    }

    return items;
  } catch (error) {
    console.error("[PrintQueueListener] ❌ Erro no polling", error);

    showWarningToast("Falha ao sincronizar impressões. Verifique sua conexão.");

    return [];
  }
}

/* ======================================================
   COMPONENT
====================================================== */

export default function PrintQueueListener() {
  const supabase = createClient();
  const { isActive } = usePrinterExtensionStore();

  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSuccessRef = useRef(now());

  function markActivity() {
    lastSuccessRef.current = now();
  }

  function resetLocalState() {
    console.warn("[PrintQueueListener] 🔄 Resetando estado local");
    processingItems.clear();
    processedItems.clear();
  }

  function reconnectRealtime() {
    if (realtimeRef.current) {
      console.warn("[PrintQueueListener] 🔌 Recriando canal realtime");
      realtimeRef.current.unsubscribe();
      realtimeRef.current = null;
    }
  }

  function manualRecover() {
    console.log("[PrintQueueListener] 🛠️ Recovery manual iniciado");

    resetLocalState();
    reconnectRealtime();
    fetchAndProcessPending().catch(console.error);
  }

  // registra função global para o toast
  manualRecoverFn = manualRecover;

  /* -------------------------------
     REALTIME
  -------------------------------- */

  useEffect(() => {
    if (!isActive) return;
    if (realtimeRef.current) return;

    console.log("[PrintQueueListener] 📡 Conectando realtime");

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
          const item = payload.new as PrintQueueType;

          console.log(`[PrintQueueListener] 🔔 Evento realtime: ${item.id}`);

          try {
            await printQueueItem(item);
            markActivity();
          } catch {
            // polling cobre
          }
        },
      )
      .subscribe((status) => {
        console.log(`[PrintQueueListener] 📡 Realtime status: ${status}`);

        if (status === "SUBSCRIBED") {
          fetchAndProcessPending().catch(console.error);
        }
      });

    realtimeRef.current = channel;

    return () => {
      channel.unsubscribe();
      realtimeRef.current = null;
    };
  }, [isActive, supabase]);

  /* -------------------------------
     POLLING HEARTBEAT
  -------------------------------- */

  useEffect(() => {
    if (!isActive) return;

    console.log("[PrintQueueListener] 🫀 Iniciando polling heartbeat");

    const interval = setInterval(() => {
      fetchAndProcessPending()
        .then(() => markActivity())
        .catch(() => {});
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [isActive]);

  /* -------------------------------
     WATCHDOG
  -------------------------------- */

  useEffect(() => {
    if (!isActive) return;

    console.log("[PrintQueueListener] 🐶 Watchdog ativo");

    const interval = setInterval(() => {
      const idle = now() - lastSuccessRef.current;

      if (idle > WATCHDOG_MAX_IDLE) {
        console.warn(
          `[PrintQueueListener] 🚨 Watchdog detectou inatividade (${idle}ms)`,
        );

        showWarningToast(
          "A impressão ficou inativa por muito tempo. Tentando recuperar automaticamente.",
        );

        resetLocalState();
        reconnectRealtime();
        fetchAndProcessPending().catch(console.error);
      }
    }, WATCHDOG_INTERVAL);

    return () => clearInterval(interval);
  }, [isActive]);

  /* -------------------------------
     NETWORK EVENTS
  -------------------------------- */

  useEffect(() => {
    if (!isActive) return;

    const handleOnline = () => {
      console.log("[PrintQueueListener] 🌐 Conexão restaurada");
      dismissWarningToast();
      resetLocalState();
      reconnectRealtime();
      fetchAndProcessPending().catch(console.error);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isActive]);

  return <PrinterExtensionStatusPoller />;
}
