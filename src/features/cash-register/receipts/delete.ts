"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { z } from "zod";

export const deleteCashReceipt = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { error } = await supabase
      .from("cash_register_receipts")
      .delete()
      .eq("id", input.id);

    if (error) {
      throw new Error("Erro ao remover recibo", error);
    }
  });
