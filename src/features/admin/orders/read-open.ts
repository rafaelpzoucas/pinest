"use server";

import { adminProcedure } from "@/lib/zsa-procedures";

export const readOpenOrders = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx;

    const { data: openOrders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("store_id", store.id)
      .eq("is_paid", false)
      .neq("status", "cancelled");

    if (error) {
      console.error("Error reading cash session payments:", error);
    }

    return { openOrders };
  });
