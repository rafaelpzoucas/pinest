"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { readOrders } from "./read";
import { readOrderById } from "./read-by-id";
import { Order, ReadOrdersType } from "./schemas";
import { readOpenOrders } from "./read-open";

export const ordersKeys = {
  all: ["orders"] as const,

  lists: (filters?: ReadOrdersType) =>
    [...ordersKeys.all, "list", filters ?? {}] as const,

  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,

  open: ["orders", "open"] as const,
};

export function useOrders(params: ReadOrdersType) {
  const queryClient = useQueryClient();

  const query = useQuery<Order[]>({
    // FIX: Passar params para a queryKey para evitar cache compartilhado
    queryKey: ordersKeys.lists(params),
    queryFn: async () => {
      // FIX: Passar params para a função
      const [data, error] = await readOrders(params);

      if (error) {
        throw error;
      }

      return (data?.orders || []) as Order[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order change received:", payload);

          // FIX: Invalidar todas as listas (com diferentes filtros)
          queryClient.invalidateQueries({
            queryKey: ordersKeys.all,
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Orders realtime conectado!");
        }

        if (status === "CHANNEL_ERROR") {
          console.error("❌ Erro na conexão orders realtime");
        }
      });

    return () => {
      console.log("Desconectando orders realtime...");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ordersKeys.all,
    });
  };
}

export function useOrderById(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Order>({
    queryKey: ordersKeys.detail(id),
    queryFn: async () => {
      const [data, error] = await readOrderById({ id });

      if (error) {
        throw error;
      }

      return data?.order as Order;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`order-${id}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Order detail change received:", payload);

          queryClient.invalidateQueries({
            queryKey: ordersKeys.detail(id),
          });

          queryClient.invalidateQueries({
            queryKey: ordersKeys.all,
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Order ${id} realtime conectado!`);
        }

        if (status === "CHANNEL_ERROR") {
          console.error(`❌ Erro na conexão order ${id} realtime`);
        }
      });

    return () => {
      console.log(`Desconectando order ${id} realtime...`);
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return query;
}

// ✅ Hook otimizado com enabled
export const useReadOpenOrders = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ordersKeys.open,
    queryFn: async () => {
      const [data, error] = await readOpenOrders();

      if (error) {
        throw error;
      }

      return data?.openOrders || [];
    },
    enabled: options?.enabled ?? true, // 👈 Aceita enabled como parâmetro
    staleTime: 1000 * 30,
    refetchInterval: options?.enabled ? 1000 * 60 : false, // 👈 Só refaz polling se enabled
  });
};
