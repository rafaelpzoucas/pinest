"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerAction, ZSAError } from "zsa";
import { readAdminStore } from "../admin/stores/read";
import { Table } from "./schemas";

export const readTables = createServerAction().handler(async () => {
  const supabase = createClient();

  const [storeData, storeError] = await readAdminStore();

  const store = storeData?.store;

  if (storeError || !store) {
    throw new ZSAError("NOT_FOUND", storeError || "Store not found");
  }

  const { data: tables, error: readTablesError } = await supabase
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

  if (readTablesError) {
    throw new ZSAError("NOT_FOUND", "Could not fetch orders");
  }

  return { tables: tables as Table[] };
});
