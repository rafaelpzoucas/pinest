"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { Table } from "./schemas";

export const readOpenTables = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    try {
      const { supabase, store } = ctx;

      if (!supabase) {
        console.error(
          "❌ [readOpenTables] CRÍTICO: Supabase client não encontrado!",
        );
        throw new Error("Supabase client não disponível");
      }

      if (!store) {
        console.error("❌ [readOpenTables] CRÍTICO: Store não encontrada!");
        throw new Error("Store não encontrada");
      }

      const queryStartTime = Date.now();

      const { data: openTables, error } = await supabase
        .from("tables")
        .select(
          `
          *,
          order_items (
            *,
            products (*)
          )
        `,
        )
        .eq("store_id", store.id)
        .eq("status", "open");

      const queryDuration = Date.now() - queryStartTime;

      if (error) {
        console.error("❌ [readOpenTables] Erro do Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        // Retorna array vazio ao invés de falhar
        console.warn(
          "⚠️ [readOpenTables] Retornando array vazio devido ao erro",
        );
        return { openTables: [] as Table[] };
      }

      if (!openTables) {
        console.warn("⚠️ [readOpenTables] openTables é null/undefined");
        return { openTables: [] as Table[] };
      }

      return { openTables: openTables as Table[] };
    } catch (err) {
      console.error("💥 [readOpenTables] EXCEPTION CAPTURADA:", {
        name: err instanceof Error ? err.name : "Unknown",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });

      // ✅ IMPORTANTE: Retornar array vazio ao invés de lançar erro
      console.warn(
        "⚠️ [readOpenTables] Retornando array vazio devido à exception",
      );
      return { openTables: [] as Table[] };
    }
  });
