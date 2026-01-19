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

export const addToPrintQueue = adminProcedure
  .createServerAction()
  .input(z.array(printQueueSchema))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx;

    const rawValues = input.map((item) => item.raw);
    const printerNames = input.map((item) => item.printer_name);

    // Ajustado para permitir o mesmo conteúdo em impressoras diferentes
    const { data: existingItems } = await supabase
      .from("print_queue")
      .select("raw, printer_name")
      .eq("store_id", store.id)
      .eq("printed", false)
      .in("raw", rawValues)
      .in("printer_name", printerNames);

    const existingKeySet = new Set(
      existingItems?.map((item) => `${item.raw}-${item.printer_name}`) || [],
    );

    const itemsToInsert = input.filter(
      (item) => !existingKeySet.has(`${item.raw}-${item.printer_name}`),
    );

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
      return;
    }

    if (!printers.length) {
      return new Response("Nenhuma impressora encontrada", { status: 404 });
    }

    const result = {
      kitchenPrinted: false,
      deliveryPrinted: false,
      errors: [] as string[],
    };

    for (const printer of printers) {
      try {
        if (
          printer.sectors.length === 0 ||
          printer.sectors.includes("kitchen")
        ) {
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
      success: result.kitchenPrinted || result.deliveryPrinted,
      ...result,
    };
  });

export const printTableBill = adminProcedure
  .createServerAction()
  .input(z.object({ tableId: z.string() }))
  .handler(async ({ input, ctx }) => {
    const [[tableData], [printSettingsData], [printersData]] =
      await Promise.all([
        readTableById({ id: input.tableId }),
        readPrintingSettings(),
        readPrinters(),
      ]);

    const table = tableData?.table;
    const printers = printersData?.printers || [];
    const printingSettings = printSettingsData?.printingSettings;
    const deliveryFontSize = printingSettings?.font_size;

    if (!printers.length) {
      throw new Error("Nenhuma impressora encontrada");
    }

    let printed = false;
    for (const printer of printers) {
      // Conta/Fechamento geralmente sai no setor delivery (caixa)
      if (
        printer.sectors.length === 0 ||
        printer.sectors.includes("delivery")
      ) {
        const textBill = buildReceiptTableBillESCPOS(ctx.store, table);
        await addToPrintQueue([
          {
            raw: textBill,
            font_size: deliveryFontSize,
            printer_name: printer.name,
          },
        ]);
        printed = true;
      }
    }

    return { success: printed };
  });

export const printOrderReceipt = createServerAction()
  .input(
    z.object({
      orderId: z.string().optional(),
      orderType: z.enum(["DELIVERY", "TAKEOUT"]).optional(),
      reprint: z.boolean().optional().default(false),
      targetPrinterName: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const [[orderData], [printSettingsData], [printersData]] =
      await Promise.all([
        readOrderById({ id: input.orderId ?? "" }),
        readPrintingSettings(),
        readPrinters(),
      ]);

    const order = orderData?.order ?? orderTest;
    const printers = printersData?.printers || [];
    const printingSettings = printSettingsData?.printingSettings;
    const deliveryFontSize = printingSettings?.font_size;

    const isDelivery = input.orderType === "DELIVERY" || !input.orderId;

    if (!printers.length) {
      return new Response("Nenhuma impressora encontrada", { status: 404 });
    }

    const result = {
      kitchenPrinted: false,
      deliveryPrinted: false,
      errors: [] as string[],
    };

    for (const printer of printers) {
      if (input.targetPrinterName && printer.name !== input.targetPrinterName) {
        continue;
      }

      try {
        if (
          printer.sectors.length === 0 ||
          printer.sectors.includes("kitchen")
        ) {
          const textKitchen = buildReceiptKitchenESCPOS(order, input.reprint);
          await addToPrintQueue([
            {
              raw: textKitchen,
              printer_name: printer.name,
            },
          ]);
          result.kitchenPrinted = true;
        }

        if (
          (isDelivery && printer.sectors.length === 0) ||
          printer.sectors.includes("delivery")
        ) {
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

export const printReportReceipt = createServerAction()
  .input(z.object({ raw: z.string() }))
  .handler(async ({ input }) => {
    const [[printerData]] = await Promise.all([readPrinters()]);
    const printers = printerData?.printers;

    if (!printers) throw new Error("Impressora não encontrada");

    for (const printer of printers) {
      if (printer.sectors.length > 0 && !printer.sectors.includes("delivery")) {
        continue;
      }
      try {
        await addToPrintQueue([{ raw: input.raw, printer_name: printer.name }]);
      } catch (error) {
        throw new Error("Erro ao imprimir relatório", error as Error);
      }
    }
    return { success: true };
  });

export const printMultipleReports = createServerAction()
  .input(
    z.object({
      reports: z.array(z.object({ raw: z.string(), name: z.string() })),
    }),
  )
  .handler(async ({ input }) => {
    const [[printerData], [printSettingsData]] = await Promise.all([
      readPrinters(),
      readPrintingSettings(),
    ]);

    const printers = printerData?.printers;
    if (!printers) throw new Error("Impressora não encontrada");

    let successfulReports = 0;
    for (const report of input.reports) {
      try {
        for (const printer of printers) {
          if (
            printer.sectors.length > 0 &&
            !printer.sectors.includes("delivery")
          ) {
            continue;
          }
          await addToPrintQueue([
            { raw: report.raw, printer_name: printer.name },
          ]);
        }
        successfulReports++;
      } catch (error) {
        console.error(`Erro no relatório ${report.name}`);
      }
    }

    return { success: successfulReports > 0, successfulReports };
  });

export const readPrintingSettings = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx;
    const { data, error } = await supabase
      .from("printer_settings")
      .select("*")
      .eq("store_id", store.id)
      .single();

    if (error || !data) console.error("Erro ao buscar settings: ", error);
    return { printingSettings: data as PrintingSettingsType };
  });

export const upsertPrintingSettings = adminProcedure
  .createServerAction()
  .input(printingSettingsSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx;
    const [printingSettingsData] = await readPrintingSettings();
    const printingSettings = printingSettingsData?.printingSettings;
    const payload = { id: printingSettings?.id, store_id: store.id, ...input };

    const { error } = await supabase.from("printer_settings").upsert(payload);
    if (error) console.error("Erro ao configurar impressão: ", error);
    revalidatePath("/config/printing");
  });

export const readAvailablePrinters = createServerAction().handler(async () => {
  try {
    const res = await fetch("http://127.0.0.1:53281/printers", {
      method: "GET",
    });
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
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

    if (error) return;
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
      if (existing.data)
        throw new Error("Já existe uma impressora com esse nome.");
    }
    await supabase
      .from("printers")
      .upsert({ ...input, store_id: store.id, id: input.id });
    revalidatePath("/config/printing");
  });

export const deletePrinter = adminProcedure
  .createServerAction()
  .input(printerSchema)
  .handler(async ({ ctx, input }) => {
    await ctx.supabase.from("printers").delete().eq("id", input.id);
    revalidatePath("/config/printing");
  });

export const readPrintPendingItemsCached = cache(readPrintPendingItems);
export const readPrinterByNameCached = cache(readPrinterByName);
export const readPrintingSettingsCached = cache(readPrintingSettings);
export const readPrintersCached = cache(readPrinters);
