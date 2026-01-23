"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { ZSAError } from "zsa";

export const readCashSession = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, user } = ctx;

    const { data: cashSession, error } = await supabase
      .from("cash_sessions")
      .select("*")
      .eq("store_id", store.id)
      .eq("user_id", user?.id)
      .eq("status", "open")
      .single();

    if (error) {
      console.error("Error reading cash session:", error);
      throw new ZSAError("NOT_FOUND", error.message);
    }

    return { cashSession };
  });
