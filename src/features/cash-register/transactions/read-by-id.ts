"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { z } from "zod";

export const readPaymentsByCashSessionId = adminProcedure
  .createServerAction()
  .input(z.object({ cashSessionId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("cash_session_id", input.cashSessionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading cash session payments:", error);
    }

    return { payments };
  });
