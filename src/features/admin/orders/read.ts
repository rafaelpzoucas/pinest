"use server";

import { createClient } from "@/lib/supabase/server";
import { readAdminStore } from "../stores/read";
import { createServerAction, ZSAError } from "zsa";
import { Order, readOrdersSchema } from "./schemas";
import { startOfDay, endOfDay } from "date-fns";

export const readOrders = createServerAction()
  .input(readOrdersSchema)
  .handler(async ({ input }) => {
    const supabase = createClient();

    const [storeData, storeError] = await readAdminStore();

    const store = storeData?.store;

    if (storeError || !store) {
      throw new ZSAError("NOT_FOUND", storeError || "Store not found");
    }

    const now = new Date();

    // FIX: Garantir que as datas sejam tratadas corretamente
    let start_date: Date;
    let end_date: Date;

    if (input?.start_date) {
      // Se vier como string ISO, converter para Date
      start_date = startOfDay(new Date(input.start_date));
    } else {
      start_date = startOfDay(now);
    }

    if (input?.end_date) {
      end_date = endOfDay(new Date(input.end_date));
    } else {
      end_date = endOfDay(now);
    }

    // Debug: Log das datas para verificar
    console.log("🔍 Buscando orders:", {
      store_id: store?.id,
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString(),
      input,
    });

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
      .gte("created_at", start_date.toISOString())
      .lte("created_at", end_date.toISOString())
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("❌ Erro ao buscar orders:", ordersError);
      throw new ZSAError("NOT_FOUND", "Could not fetch orders");
    }

    console.log(`✅ ${orders?.length || 0} orders encontradas`);

    return { orders: orders as Order[] };
  });
