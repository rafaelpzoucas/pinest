"use server";

import { adminProcedure } from "@/lib/zsa-procedures";
import { Table } from "./schemas";

export const readOpenTables = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx;

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

    if (error) {
      console.error("Error reading cash session payments:", error);
    }

    return { openTables: openTables as Table[] };
  });
