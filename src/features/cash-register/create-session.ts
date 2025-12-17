"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { openCashSessionSchema } from "./schemas";
import { stringToNumber } from "@/lib/utils";

export const createCashSession = adminProcedure
  .createServerAction()
  .input(openCashSessionSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, user } = ctx;

    const { data: cashSession, error: cashSessionError } = await supabase
      .from("cash_sessions")
      .insert({
        user_id: user?.id,
        store_id: store.id,
        opening_balance: stringToNumber(input.opening_balance),
      })
      .select()
      .single();

    if (cashSessionError) {
      console.error("Error creating cash session:", cashSessionError);
    }

    const { data: createdPayment, error } = await supabase
      .from("payments")
      .insert({
        amount: stringToNumber(input.opening_balance),
        status: "confirmed",
        store_id: store.id,
        cash_session_id: cashSession.id,
        description: "Abertura de caixa",
      })
      .select();

    if (error || !createdPayment) {
      console.error("Error creating payment transaction.", error);
      return;
    }
  });
