"use server";

import { cashProcedure } from "@/lib/zsa-procedures";

export const readCashSessionPayments = cashProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, cashSession } = ctx;

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("store_id", store.id)
      .eq("cash_session_id", cashSession.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading cash session payments:", error);
    }

    return { payments };
  });
