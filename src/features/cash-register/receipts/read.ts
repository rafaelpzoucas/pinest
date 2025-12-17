"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { readCashSession } from "../read";
import { createCashReceiptsSchema } from "../schemas";
import { z } from "zod";

export const readCashReceipts = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase } = ctx;

    const [cashSessionData] = await readCashSession();
    const cashSession = cashSessionData?.cashSession;

    const { data, error } = await supabase
      .from("cash_register_receipts")
      .select("*")
      .eq("session_id", cashSession.id);

    if (error) {
      console.error("Não foi possível encontrar os recibos", error);
    }

    return { cashReceipts: data as z.infer<typeof createCashReceiptsSchema> };
  });
