"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { updateTableSchema } from "./schemas";
import { printTableReceipt } from "@/app/(protected)/(app)/config/printing/actions";
import { updateAmountSoldAndStock } from "../admin/orders/update-amount-sold";

export const updateTable = adminProcedure
  .createServerAction()
  .input(updateTableSchema)
  .handler(async ({ ctx: { supabase }, input }) => {
    // 1. Se for edição, busca antigos antes de apagar
    let oldItems: { product_id: string; quantity: number }[] = [];
    if (input.is_edit) {
      const { data: fetched, error: fetchErr } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("table_id", input.id);

      if (fetchErr) {
        console.error("Erro buscando itens antigos:", fetchErr);
        throw new Error("Erro ao buscar itens antigos");
      }
      oldItems = fetched || [];

      const { error: delErr } = await supabase
        .from("order_items")
        .delete()
        .eq("table_id", input.id);

      if (delErr) {
        console.error("Erro deletando itens antigos:", delErr);
        throw new Error("Erro ao deletar itens antigos");
      }
    }

    // 2. Pré-monta payload de novos items
    const newItemsPayload = input.order_items.map((item) => ({
      table_id: input.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product_price: item.product_price,
      observations: item.observations,
      extras: item.extras,
    }));

    // 3. Insere novos e, em paralelo, dispara impressão
    const insertResult = supabase
      .from("order_items")
      .insert(newItemsPayload)
      .select("product_id, quantity");

    printTableReceipt({
      printerName: "G250",
      tableId: input.id,
      reprint: true,
    });

    // 4. Atualiza estoque com base no diff
    const { data: newItems, error: insErr } = await insertResult;
    if (insErr) {
      console.error("Erro inserindo novos itens:", insErr);
      throw new Error("Erro ao inserir novos itens");
    }

    // calcula diffs
    const diffMap: Record<string, number> = {};
    oldItems.forEach(({ product_id: productId, quantity }) => {
      diffMap[productId] = (diffMap[productId] || 0) - quantity;
    });
    newItems.forEach(({ product_id: productId, quantity }) => {
      diffMap[productId] = (diffMap[productId] || 0) + quantity;
    });

    // aplica todas as atualizações de estoque em paralelo
    await Promise.all(
      Object.entries(diffMap).map(([productId, diff]) =>
        updateAmountSoldAndStock(productId, diff),
      ),
    );

    // Retorna sucesso em vez de redirect
    return { success: true, tableId: input.id };
  });
