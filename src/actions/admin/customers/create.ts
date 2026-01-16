import { createClient } from "@/lib/supabase/server";
import { StoreCustomerType } from "@/models/store-customer";
import { createServerAction, ZSAError } from "zsa";
import { createAdminCustomerSchema } from "./schemas";

export const createAdminCustomerServer = createServerAction()
  .input(createAdminCustomerSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { phone, name, address, storeId } = input;

    const { data: createdCustomer, error: createCustomerError } = await supabase
      .from("customers")
      .insert({ phone: phone || null, name, address })
      .select()
      .single();

    if (createCustomerError) {
      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        createCustomerError.message ?? "Error creating customers.",
      );
    }

    const { data: createdStoreCustomer, error: createStoreCustomerError } =
      await supabase
        .from("store_customers")
        .insert({ customer_id: createdCustomer?.id, store_id: storeId })
        .select()
        .single();

    if (createStoreCustomerError) {
      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        createStoreCustomerError.message ?? "Error adding customer to store.",
      );
    }

    const createdStoreCustomerData: StoreCustomerType = {
      ...createdStoreCustomer,
      customers: createdCustomer,
    };

    return { createdStoreCustomer: createdStoreCustomerData };
  });
