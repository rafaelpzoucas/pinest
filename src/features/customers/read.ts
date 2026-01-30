"use server";

import { StoreCustomerType } from "@/models/store-customer";
import { createServerAction, ZSAError } from "zsa";
import { readAdminCustomersSchema } from "./schemas";
import { createClient } from "@/lib/supabase/server";

export const readAdminCustomers = createServerAction()
  .input(readAdminCustomersSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    let query = supabase
      .from("store_customers")
      .select(
        `
          *,
          customers!inner(*)
        `,
      )
      .eq("store_id", input.storeId);

    if (input.search && input.search.length >= 2) {
      const searchTerm = input.search.toLowerCase();
      const isNumeric = /^\d+$/.test(searchTerm.replace(/\D/g, ""));

      if (isNumeric) {
        const phoneDigits = searchTerm.replace(/\D/g, "");
        query = query.ilike("customers.phone", `%${phoneDigits}%`);
      } else {
        query = query.ilike("customers.name", `%${searchTerm}%`);
      }
    }

    query = query.limit(50);

    const { data: customers, error: customersError } = await query;

    if (customersError) {
      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        customersError.message ?? "Error fetching customers.",
      );
    }

    return { customers: customers as StoreCustomerType[] };
  });
