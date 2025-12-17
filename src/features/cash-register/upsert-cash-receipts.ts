"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { readCashSession } from "./read";
import { createCashReceiptsSchema } from "./schemas";

export const upsertCashReceipts = adminProcedure
  .createServerAction()
  .input(createCashReceiptsSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const [cashSessionData] = await readCashSession();
    const cashSession = cashSessionData?.cashSession;

    if (!cashSession) {
      throw new Error("Sessão de caixa não encontrada");
    }

    if (!input.length) {
      // Se não há recibos enviados, não faz nada
      return;
    }

    // Todos os recibos enviados devem ser do mesmo tipo
    const receiptType = input[0].type;

    if (receiptType.startsWith("cash_")) {
      // Remove todos os recibos de dinheiro da sessão
      await supabase
        .from("cash_register_receipts")
        .delete()
        .eq("session_id", cashSession.id)
        .like("type", "cash_%");
    } else {
      // Remove todos os recibos do mesmo tipo da sessão
      await supabase
        .from("cash_register_receipts")
        .delete()
        .eq("session_id", cashSession.id)
        .eq("type", receiptType);
    }

    // Insere os novos recibos
    const { data, error } = await supabase
      .from("cash_register_receipts")
      .insert(
        input.map((receipt) => ({
          ...receipt,
          session_id: cashSession.id,
          value: Number(receipt.value),
          amount: Number(receipt.amount),
          total: Number(receipt.total),
        })),
      );

    if (error) {
      throw new Error("Não foi possível adicionar o(s) recibo(s)", error);
    }
  });
