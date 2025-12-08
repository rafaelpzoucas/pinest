"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { readOrders } from "./read";
import { readOrderById } from "./read-by-id";
import { Order } from "./schemas";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
};

export function useOrders() {
  const queryClient = useQueryClient();

  const query = useQuery<Order[]>({
    queryKey: ordersKeys.lists(),
    queryFn: async () => {
      const [data, error] = await readOrders();

      if (error) {
        throw error;
      }

      // Garantir que retorna array de orders
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

          // Invalidar cache para refetch
          queryClient.invalidateQueries({
            queryKey: ordersKeys.lists(),
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

// Hook para atualização otimista manual (útil para mutations)
export function useInvalidateOrders() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: ordersKeys.lists(),
    });
  };
}

// Hook para buscar order por ID
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
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id, // Só executa se tiver ID
  });

  // Realtime subscription para order específica
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

          // Invalidar cache da order específica
          queryClient.invalidateQueries({
            queryKey: ordersKeys.detail(id),
          });

          // Também invalidar a lista
          queryClient.invalidateQueries({
            queryKey: ordersKeys.lists(),
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
