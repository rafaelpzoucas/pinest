"use server";

import { cashProcedure } from "@/lib/zsa-procedures";
import { createTransactionFormSchema } from "../schemas";
import { stringToNumber } from "@/lib/utils";
import { ZSAError } from "zsa";

export const createCashSessionTransaction = cashProcedure
  .createServerAction()
  .input(createTransactionFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, cashSession } = ctx;

    if (!cashSession) {
      return;
    }

    const { error: transactionError } = await supabase.from("payments").insert({
      ...input,
      store_id: store.id,
      cash_session_id: cashSession.id,
      amount: stringToNumber(input.amount),
    });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      throw new ZSAError("FORBIDDEN", transactionError.message);
    }
  });
