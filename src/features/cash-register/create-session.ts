"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { openCashSessionSchema } from "./schemas";
import { stringToNumber } from "@/lib/utils";
import { ZSAError } from "zsa";

export const createCashSession = adminProcedure
  .createServerAction()
  .input(openCashSessionSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, user } = ctx;

    // Validar se já existe um caixa em aberto para esta loja
    const { data: existingCashSession, error: checkError } = await supabase
      .from("cash_sessions")
      .select("id")
      .eq("store_id", store.id)
      .is("closed_at", null)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = nenhum registro encontrado
      console.error("Error checking existing cash session:", checkError);
      throw new ZSAError(
        "ERROR",
        "Erro ao verificar sessões de caixa existentes.",
      );
    }

    if (existingCashSession) {
      throw new ZSAError(
        "CONFLICT",
        "Já existe um caixa em aberto para esta loja. Feche o caixa atual antes de abrir um novo.",
      );
    }

    // Criar nova sessão de caixa
    const { data: cashSession, error: cashSessionError } = await supabase
      .from("cash_sessions")
      .insert({
        user_id: user?.id,
        store_id: store.id,
        opening_balance: stringToNumber(input.opening_balance),
      })
      .select()
      .single();

    if (cashSessionError || !cashSession) {
      console.error("Error creating cash session:", cashSessionError);
      throw new ZSAError("ERROR", "Erro ao criar sessão de caixa.");
    }

    // Criar transação de abertura
    const { data: createdPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount: stringToNumber(input.opening_balance),
        status: "confirmed",
        store_id: store.id,
        cash_session_id: cashSession.id,
        description: "Abertura de caixa",
      })
      .select()
      .single();

    if (paymentError || !createdPayment) {
      console.error("Error creating payment transaction:", paymentError);
      throw new ZSAError("ERROR", "Erro ao criar transação de abertura.");
    }

    return {
      cashSession,
      payment: createdPayment,
    };
  });
