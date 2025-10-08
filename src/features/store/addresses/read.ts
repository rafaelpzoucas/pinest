"use server";

import { createServerAction, ZSAError } from "zsa";
import type { Address } from "@/features/admin/address/schemas";
import { createClient } from "@/lib/supabase/server";
import { readStoreIdBySlug } from "../store/read";
import { ReadStoreAddressSchema } from "./schemas";

export const readStoreAddress = createServerAction()
  .input(ReadStoreAddressSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const [storeData] = await readStoreIdBySlug({ storeSlug: input.subdomain });

    const { data: storeAddress, error: storeAddressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("store_id", storeData?.storeId)
      .single();

    if (storeAddressError) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", storeAddressError.message);
    }

    return { storeAddress: storeAddress as Address };
  });
