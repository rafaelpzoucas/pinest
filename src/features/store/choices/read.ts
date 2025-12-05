"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createServerAction, ZSAError } from "zsa";
import { Extra } from "../extras/schemas";

export const readProductExtras = createServerAction()
  .input(
    z.object({
      storeId: z.string(),
      productId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { data, error } = await supabase.rpc("get_extras_for_product", {
      p_store_id: input.storeId,
      p_product_id: input.productId || null,
    });

    if (error) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", error.message);
    }

    return { extras: data as Extra[] };
  });
