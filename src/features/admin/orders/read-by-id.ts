"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerAction, ZSAError } from "zsa";
import { Order } from "./schemas";
import { z } from "zod";

export const readOrderById = createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          *,
          order_items (
            *,  
            products (*)
          ),
          store_customers (
            *,
            customers (*)
          )
        `,
      )
      .eq("id", input.id)
      .single();

    if (orderError) {
      throw new ZSAError("NOT_FOUND", "Could not fetch orders");
    }

    return { order: order as Order };
  });
