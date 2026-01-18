"use server";

import {
  buildReceiptDeliveryESCPOS,
  buildReceiptKitchenESCPOS,
  buildReceiptTableBillESCPOS,
  buildReceiptTableESCPOS,
} from "@/lib/receipts";
import { adminProcedure } from "@/lib/zsa-procedures";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import { createServerAction } from "zsa";
import { readOrderById } from "../../orders/deliveries/[id]/actions";
import { readTableById } from "../../orders/tables/[id]/actions";
import { orderTest } from "./order-test";
import {
  printerSchema,
  PrinterType,
  printingSettingsSchema,
  PrintingSettingsType,
  printQueueSchema,
  PrintQueueType,
} from "./schemas";

// ====================================
// FUNÇÃO AUXILIAR
// ====================================
function shouldPrintReceipt(
  printerSectors: string[],
  receiptType: "kitchen" | "delivery",
): boolean {
  // Se sectors está vazio, imprime tudo
  if (printerSectors.length === 0) {
    return true;
  }

  // Se sectors tem o tipo específico, imprime
  return printerSectors.includes(receiptType);
}

// ====================================
// FILA DE IMPRESSÃO
// ====================================
export const addToPrintQueue = adminProcedure
  .createServerAction()
  .input(z.array(printQueueSchema))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx;

    // Buscar itens não impressos com os mesmos raw
    const rawValues = input.map((item) => item.raw);

    const { data: existingItems } = await supabase
      .from("print_queue")
      .select("raw")
      .eq("store_id", store.id)
      .eq("printed", false)
      .in("raw", rawValues);

    const existingRaws = new Set(existingItems?.map((item) => item.raw) || []);

    // Filtrar apenas itens que não existem ou já foram impressos
    const itemsToInsert = input.filter((item) => !existingRaws.has(item.raw));

    if (itemsToInsert.length === 0) {
      return { success: true, message: "Todos os itens já estão na fila" };
    }

    const { error } = await supabase.from("print_queue").insert(
      itemsToInsert.map((item) => ({
        store_id: store.id,
        text: item.text,
        raw: item.raw,
        font_size: item.font_size,
        printer_name: item.printer_name,
      })),
    );

    if (error) {
      throw new Error(
        "Erro ao adicionar itens à fila de impressão: " + error.message,
      );
    }

    return {
      success: true,
      inserted: itemsToInsert.length,
      skipped: input.length - itemsToInsert.length,
    };
  });

export const updatePrintQueueItem = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from("print_queue")
      .update({ printed: true, printed_at: new Date().toISOString() })
      .eq("id", input.id);

    if (error) {
      throw new Error("Erro ao atualizar item da fila de impressão", error);
    }
  });

export const readPrintPendingItems = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx;

    const { data, error } = await supabase
      .from("print_queue")
      .select("*")
      .eq("printed", false)
      .eq("store_id", store.id);

    if (error) throw new Error("Erro ao buscar itens pendentes: ", error);

    return { pendingItems: data as PrintQueueType[] };
  });

export const readPrinterByName = adminProcedure
  .createServerAction()
  .input(z.object({ name: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx;

    const { data, error } = await supabase
      .from("printers")
      .select("*")
      .eq("name", input.name)
      .eq("store_id", store.id)
      .single();

    if (error) {
      console.error("Erro ao buscar impressora pelo nome: ", error);
    }

    return { printer: data as PrinterType };
  });

// ====================================
// IMPRESSÃO DE MESA (TABLE)
// ====================================
export const printTableReceipt = createServerAction()
  .input(
    z.object({
      tableId: z.string().optional(),
      printerName: z.string().optional(),
      reprint: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [[tableData], [printSettingsData], [printersData]] =
      await Promise.all([
        readTableById({ id: input.tableId }),
        readPrintingSettings(),
        readPrinters(),
      ]);

    const table = tableData?.table;
    const printers = printersData?.printers || [];
    const printingSettings = printSettingsData?.printingSettings;

    if (!printingSettings?.auto_print) {
      return { success: false, message: "Auto-impressão desabilitada" };
    }

    if (!printers.length) {
      return { success: false, message: "Nenhuma impressora encontrada" };
    }

    const result = {
      kitchenPrinted: false,
      errors: [] as string[],
    };

    // Processar cada impressora
    for (const printer of printers) {
      try {
        // Verifica se deve imprimir comanda de cozinha para esta impressora
        if (shouldPrintReceipt(printer.sectors, "kitchen")) {
          const textKitchen = buildReceiptTableESCPOS(table, input.reprint);

          await addToPrintQueue([
            {
              raw: textKitchen,
              printer_name: printer.name,
            },
          ]);

          result.kitchenPrinted = true;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Erro na impressora "${printer.name}": ${errorMsg}`);
        console.error(errorMsg);
      }
    }

    return {
      success: result.kitchenPrinted,
      ...result,
    };
  });

export const printTableBill = createServerAction()
  .input(
    z.object({
      tableId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const [[tableData], [printSettingsData], [printersData]] =
      await Promise.all([
        readTableById({ id: input.tableId }),
        readPrintingSettings(),
        readPrinters(),
      ]);

    const table = tableData?.table;
    const printers = printersData?.printers || [];
    const printingSettings = printSettingsData?.printingSettings;

    if (!table) {
      return { success: false, message: "Mesa não encontrada" };
    }

    if (!printers.length) {
      return { success: false, message: "Nenhuma impressora encontrada" };
    }

    const result = {
      billPrinted: false,
      errors: [] as string[],
    };

    // Processar cada impressora que imprime delivery (contas são similares)
    for (const printer of printers) {
      try {
        if (shouldPrintReceipt(printer.sectors, "delivery")) {
          const textBill = buildReceiptTableBillESCPOS(table);
          const deliveryFontSize = printingSettings?.font_size;

          await addToPrintQueue([
            {
              raw: textBill,
              font_size: deliveryFontSize,
              printer_name: printer.name,
            },
          ]);

          result.billPrinted = true;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Erro na impressora "${printer.name}": ${errorMsg}`);
        console.error(errorMsg);
      }
    }

    return {
      success: result.billPrinted,
      ...result,
    };
  });

// ====================================
// IMPRESSÃO DE PEDIDO (ORDER)
// ====================================
export const printOrderReceipt = createServerAction()
  .input(
    z.object({
      orderId: z.string().optional(),
      orderType: z.enum(["DELIVERY", "TAKEOUT"]).optional(),
      reprint: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ input }) => {
    // Se não tiver orderId, usa o pedido de teste diretamente
    let order = orderTest;

    if (input.orderId) {
      const [orderData] = await readOrderById({ id: input.orderId });
      order = orderData?.order ?? orderTest;
    }

    const [[printSettingsData], [printersData]] = await Promise.all([
      readPrintingSettings(),
      readPrinters(),
    ]);

    const printers = printersData?.printers || [];
    const printingSettings = printSettingsData?.printingSettings;
    const deliveryFontSize = printingSettings?.font_size;

    const isDelivery = input.orderType === "DELIVERY";

    if (!printers.length) {
      return { success: false, message: "Nenhuma impressora encontrada" };
    }

    const result = {
      kitchenPrinted: false,
      deliveryPrinted: false,
      errors: [] as string[],
    };

    // Processar cada impressora
    for (const printer of printers) {
      try {
        // SEMPRE imprime comanda de cozinha se a impressora permitir
        if (shouldPrintReceipt(printer.sectors, "kitchen")) {
          const textKitchen = buildReceiptKitchenESCPOS(order, input.reprint);

          await addToPrintQueue([
            {
              raw: textKitchen,
              printer_name: printer.name,
            },
          ]);

          result.kitchenPrinted = true;
        }

        // APENAS imprime comanda de delivery se:
        // 1. O pedido for delivery
        // 2. A impressora permitir impressão de delivery
        if (isDelivery && shouldPrintReceipt(printer.sectors, "delivery")) {
          const textDelivery = buildReceiptDeliveryESCPOS(order, input.reprint);

          await addToPrintQueue([
            {
              raw: textDelivery,
              font_size: deliveryFontSize,
              printer_name: printer.name,
            },
          ]);

          result.deliveryPrinted = true;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Erro na impressora "${printer.name}": ${errorMsg}`);
        console.error(errorMsg);
      }
    }

    return {
      success: result.kitchenPrinted || result.deliveryPrinted,
      ...result,
    };
  });

// ====================================
// IMPRESSÃO DE RELATÓRIO
// ====================================
export const printReportReceipt = createServerAction()
  .input(
    z.object({
      raw: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const [[printerData]] = await Promise.all([readPrinters()]);

    const printers = printerData?.printers;

    if (!printers || printers.length === 0) {
      throw new Error("Nenhuma impressora encontrada");
    }

    let printed = false;

    for (const printer of printers) {
      // Relatórios só são impressos em impressoras de delivery ou sem setor definido
      if (shouldPrintReceipt(printer.sectors, "delivery")) {
        try {
          await addToPrintQueue([
            {
              raw: input.raw,
              printer_name: printer.name,
            },
          ]);
          printed = true;
        } catch (error) {
          console.error(
            `Erro ao imprimir na impressora ${printer.name}:`,
            error,
          );
        }
      }
    }

    return { success: printed };
  });

// ====================================
// IMPRESSÃO DE MÚLTIPLOS RELATÓRIOS
// ====================================
export const printMultipleReports = createServerAction()
  .input(
    z.object({
      reports: z.array(
        z.object({
          raw: z.string(),
          name: z.string(),
        }),
      ),
    }),
  )
  .handler(async ({ input }) => {
    console.log(
      "Iniciando impressão de múltiplos relatórios:",
      input.reports.length,
    );

    const [[printerData], [printSettingsData]] = await Promise.all([
      readPrinters(),
      readPrintingSettings(),
    ]);

    const printers = printerData?.printers;

    if (!printers || printers.length === 0) {
      throw new Error("Nenhuma impressora encontrada");
    }

    const results = [];
    let successfulReports = 0;
    const totalReports = input.reports.length;

    for (const report of input.reports) {
      console.log(`Imprimindo relatório: ${report.name}`);
      let reportPrinted = false;

      try {
        for (const printer of printers) {
          // Relatórios só são impressos em impressoras de delivery ou sem setor
          if (shouldPrintReceipt(printer.sectors, "delivery")) {
            await addToPrintQueue([
              {
                raw: report.raw,
                printer_name: printer.name,
              },
            ]);

            console.log(
              `Relatório "${report.name}" enviado para impressora ${printer.name}`,
            );
            reportPrinted = true;
          } else {
            console.log(
              `Pulando impressora ${printer.name} - setor não compatível`,
            );
          }
        }

        results.push({ name: report.name, success: reportPrinted });
        if (reportPrinted) successfulReports++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Erro ao imprimir relatório "${report.name}":`, errorMsg);
        results.push({ name: report.name, success: false, error: errorMsg });
      }
    }

    console.log(
      `Impressão concluída: ${successfulReports}/${totalReports} relatórios impressos com sucesso`,
    );

    return {
      success: successfulReports > 0,
      results,
      totalReports,
      successfulReports,
    };
  });

// ====================================
// CONFIGURAÇÕES DE IMPRESSÃO
// ====================================
export const readPrintingSettings = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx;

    const { data, error } = await supabase
      .from("printer_settings")
      .select("*")
      .eq("store_id", store.id)
      .single();

    if (error || !data) {
      console.error("Erro ao buscar configurações de impressão: ", error);
    }

    return { printingSettings: data as PrintingSettingsType };
  });

export const upsertPrintingSettings = adminProcedure
  .createServerAction()
  .input(printingSettingsSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx;

    const [printingSettingsData] = await readPrintingSettings();

    const printingSettings = printingSettingsData?.printingSettings;

    const test = { id: printingSettings?.id, store_id: store.id, ...input };

    const { error } = await supabase.from("printer_settings").upsert(test);

    if (error) {
      console.error("Erro ao configurar impressão: ", error);
    }
  });

// ====================================
// GERENCIAMENTO DE IMPRESSORAS
// ====================================
export const readAvailablePrinters = createServerAction().handler(async () => {
  try {
    const res = await fetch("http://127.0.0.1:53281/printers", {
      method: "GET",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Erro ao verificar extensão", error);
    return { success: false, error: (error as Error).message };
  }
});

export const readPrinters = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx;

    const { data, error } = await supabase
      .from("printers")
      .select("*")
      .eq("store_id", store.id);

    if (error) {
      console.error("Erro ao buscar impressoras", error);
      return;
    }

    return { printers: data as PrinterType[] };
  });

export const createPrinter = adminProcedure
  .createServerAction()
  .input(printerSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx;

    if (!input.id) {
      const existing = await supabase
        .from("printers")
        .select("id")
        .eq("store_id", store.id)
        .eq("name", input.name)
        .single();

      if (existing.data) {
        throw new Error("Já existe uma impressora com esse nome nesta loja.");
      }
    }

    const { error } = await supabase
      .from("printers")
      .upsert({ ...input, store_id: store.id, id: input.id })
      .eq("store_id", store.id);

    if (error) {
      console.error("Erro ao criar impressora", error);
      return;
    }

    revalidatePath("/config/printing");
  });

export const deletePrinter = adminProcedure
  .createServerAction()
  .input(printerSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from("printers")
      .delete()
      .eq("id", input.id);

    if (error) {
      console.error("Erro ao deletar Impressora: ", error);
    }

    revalidatePath("/config/printing");
  });

// ====================================
// CACHED FUNCTIONS
// ====================================
export const readPrintPendingItemsCached = cache(readPrintPendingItems);
export const readPrinterByNameCached = cache(readPrinterByName);
export const readPrintingSettingsCached = cache(readPrintingSettings);
export const readPrintersCached = cache(readPrinters);
