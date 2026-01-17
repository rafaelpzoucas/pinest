"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { z } from "zod";
import { createTableSchema } from "./schemas";
import { updateAmountSoldAndStock } from "../admin/orders/update-amount-sold";
import { printTableReceipt } from "@/app/(protected)/(app)/config/printing/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const checkTableExists = adminProcedure
  .createServerAction()
  .input(z.object({ number: z.number() }))
  .handler(async ({ ctx: { supabase, store }, input }) => {
    const { data, error } = await supabase
      .from("tables")
      .select("id")
      .eq("store_id", store.id)
      .eq("number", input.number)
      .eq("status", "open");

    if (error) {
      console.error("Erro lendo mesas:", error);
      return false;
    }

    return (data.length ?? 0) > 0;
  });

export const createTable = adminProcedure
  .createServerAction()
  .input(createTableSchema)
  .handler(async ({ ctx: { supabase, store }, input }) => {
    const [exists] = await checkTableExists({ number: Number(input.number) });

    if (exists) {
      throw new Error("Esta mesa já está aberta.");
    }

    const tablePayload = {
      number: input.number,
      description: input.description,
      store_id: store.id,
    };

    const itemsPayload = input.order_items.map((item) => ({
      table_id: null,
      product_id: item.product_id,
      quantity: item.quantity,
      product_price: item.product_price,
      observations: item.observations,
      extras: item.extras,
    }));

    const { data: tbl, error: tblErr } = await supabase
      .from("tables")
      .insert(tablePayload)
      .select("id")
      .single();

    if (tblErr || !tbl) {
      console.error("Erro criando mesa:", tblErr);
      throw new Error("Erro ao criar mesa");
    }

    const tableId = tbl.id;

    const insertItems = supabase
      .from("order_items")
      .insert(itemsPayload.map((it) => ({ ...it, table_id: tableId })))
      .select("product_id, quantity");

    printTableReceipt({ tableId, reprint: false });

    const { data: newItems, error: insErr } = await insertItems;
    if (insErr) {
      console.error("Erro inserindo itens na mesa:", insErr);
      throw new Error("Erro ao inserir itens na mesa");
    }

    await Promise.all(
      newItems.map(({ product_id: productId, quantity }) =>
        updateAmountSoldAndStock(productId, quantity),
      ),
    );

    // Revalida o cache da página de destino
    revalidatePath("/orders");

    // Redirect server-side (mais rápido)
    redirect("/orders?tab=tables");
  });
