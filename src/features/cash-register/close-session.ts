"use server";

import { cashProcedure } from "@/lib/zsa-procedures";
import { closeCashSessionSchema } from "./schemas";
import { stringToNumber } from "@/lib/utils";

export const closeCashSession = cashProcedure
  .createServerAction()
  .input(closeCashSessionSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, cashSession } = ctx;

    const { error } = await supabase
      .from("cash_sessions")
      .update({
        closing_balance: stringToNumber(input.closing_balance),
        closing_balance_cash: stringToNumber(input.cash_balance),
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", cashSession.id);

    if (error) {
      console.error("Error creating cash session:", error);
    }
  });
