"use server";

import { cashProcedure } from "@/lib/zsa-procedures";
import { PaymentType } from "@/models/payment";
import { ZSAError } from "zsa";

export const readCashSessionPayments = cashProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, cashSession } = ctx;

    if (!cashSession) {
      return { payments: [] };
    }

    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        `
          id,
          amount,
          description,
          payment_type,
          type,
          created_at
        `,
      )
      .eq("store_id", store.id)
      .eq("cash_session_id", cashSession.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error reading cash session payments:", error);
      throw new ZSAError("NOT_FOUND", error.message);
    }

    return { payments: payments as PaymentType[] };
  });
