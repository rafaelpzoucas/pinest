"use server";

import { createServerAction, ZSAError } from "zsa";
import { createClient } from "@/lib/supabase/server";
import { CreateCustomerSchema } from "./schemas";

export const createStoreCustomer = createServerAction()
  .input(CreateCustomerSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { subdomain, customerId, ...customerData } = input;

    let newCustomerId = customerId;

    if (!customerId) {
      const { data: createdCustomer, error: createCustomerError } =
        await supabase
          .from("customers")
          .insert(customerData)
          .select("id")
          .single();

      if (createCustomerError || !createdCustomer) {
        console.error("Error creating customer", {
          createCustomerError,
          createdCustomer,
        });
        return;
      }

      newCustomerId = createdCustomer.id;
    }

    const [{ data: store, error: readStoreError }] = await Promise.all([
      supabase
        .from("stores")
        .select("id")
        .eq("store_subdomain", subdomain)
        .single(),
    ]);

    if (readStoreError) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", readStoreError?.message);
    }

    const { data: createdStoreCustomer, error: createStoreCustomerError } =
      await supabase
        .from("store_customers")
        .insert({ customer_id: newCustomerId, store_id: store?.id })
        .select()
        .single();

    if (createStoreCustomerError || !createdStoreCustomer) {
      console.error(
        "Não foi possível adicionar o cliente à loja",
        createStoreCustomerError,
      );
    }
  });
