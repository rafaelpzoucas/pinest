"use server";

import { createClient } from "@/lib/supabase/server";
import { readAdminStore } from "../stores/read";
import { createServerAction, ZSAError } from "zsa";
import { Order } from "./schemas";

export const readOrders = createServerAction().handler(async () => {
  const supabase = createClient();

  const [storeData, storeError] = await readAdminStore();

  const store = storeData?.store;

  if (storeError || !store) {
    throw new ZSAError("NOT_FOUND", storeError || "Store not found");
  }

  const { data: orders, error: ordersError } = await supabase
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
    .eq("store_id", store?.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    throw new ZSAError("NOT_FOUND", "Could not fetch orders");
  }

  return { orders: orders as Order[] };
});
