"use server";

import { z } from "zod";
import { createServerAction, ZSAError } from "zsa";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "./schemas";

export const readProductBySlug = createServerAction()
  .input(z.object({ productSlug: z.string(), storeId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
          *, 
          product_images(*),
          product_choice_prices(
            id,
            choice_id,
            size,
            price,
            product_choices(
              id,
              name,
              description,
              category_id,
              is_active
            )
          )
        `,
      )
      .eq("product_url", input.productSlug)
      .eq("store_id", input.storeId)
      .single();

    if (error) {
      throw new ZSAError("INTERNAL_SERVER_ERROR", error.message);
    }

    return { product: data as Product };
  });
