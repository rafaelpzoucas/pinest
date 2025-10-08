// actions.ts
"use server";

import { createServerAction, ZSAError } from "zsa";
import { createClient } from "@/lib/supabase/server";
import type { StoreCustomer } from "../customers/schemas";
import { ReadStoreCustomerSchema } from "./schemas";

export const readStoreCustomer = createServerAction()
  .input(ReadStoreCustomerSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("store_customers")
      .select(
        `
          *,
          customer:customers!inner (*)
        `,
      )
      .eq("store_id", input.storeId)
      .eq("customer_id", input.customerId)
      .single();

    if (error) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", error.message);
    }

    // Retorna o objeto diretamente (sem wrapper extra)
    return data as StoreCustomer;
  });
