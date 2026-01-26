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

    let start_date: Date;
    let end_date: Date;

    if (input?.start_date) {
      start_date = startOfDay(new Date(input.start_date));
    } else {
      start_date = startOfDay(now);
    }

    if (input?.end_date) {
      end_date = endOfDay(new Date(input.end_date));
    } else {
      end_date = endOfDay(now);
    }

    console.log("🔍 Buscando orders:", {
      store_id: store?.id,
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString(),
      input,
    });

    // Buscar pedidos do período especificado OU pedidos em aberto
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
      .or(
        // Pedidos do período
        `and(created_at.gte.${start_date.toISOString()},created_at.lte.${end_date.toISOString()}),` +
          // OU pedidos em aberto
          `and(is_paid.eq.false,status.neq.cancelled),` +
          // OU pedidos iFood recentes ainda não finalizados
          `and(is_ifood.eq.true,status.in.(pending,preparing,shipped,readyToPickup))`,
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("❌ Erro ao buscar orders:", ordersError);
      throw new ZSAError("NOT_FOUND", "Could not fetch orders");
    }

    return { orders: orders as Order[] };
  });
