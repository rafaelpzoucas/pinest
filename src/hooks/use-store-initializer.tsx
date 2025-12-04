// hooks/use-store-initializer.tsx
"use client";

import { useEffect, useRef } from "react";
import { calculateStoreStatus } from "@/app/[store_slug]/(status)/calculate";
import type { Store } from "@/features/store/initial-data/schemas";
import { createClient } from "@/lib/supabase/client";
import { useStoreStatusStore } from "@/stores/store-status";

// Store parcial, mas com ID obrigatório
type PartialStoreWithId = Partial<Store> & { id: string };

export function useStoreInitializer(store?: PartialStoreWithId | null) {
  const isInitialized = useRef(false);
  const currentStoreId = useStoreStatusStore((state) => state.currentStore?.id);

  // Inicializa quando recebe a store
  useEffect(() => {
    if (!store?.id) return;

    // Se já está inicializada com a mesma loja, não faz nada
    if (isInitialized.current && currentStoreId === store.id) return;

    // Busca os dados completos da store
    const fetchCompleteStore = async () => {
      const supabase = createClient();
      const { data: completeStore, error } = await supabase
        .from("stores")
        .select("*, store_hours(*), shippings(*)")
        .eq("id", store.id)
        .single();

      if (error) {
        console.error("Erro ao buscar store completa:", error);
        return;
      }

      if (completeStore) {
        const initialStatus = calculateStoreStatus(completeStore as Store);

        useStoreStatusStore.setState({
          status: initialStatus,
          currentStore: completeStore as Store,
          enableRealTime: true,
          enableRealtimeSubscription: true,
        });

        isInitialized.current = true;
      }
    };

    fetchCompleteStore();
  }, [store?.id, currentStoreId]);

  // Polling
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useStoreStatusStore.getState();
      if (state.enableRealTime && state.currentStore) {
        const newStatus = calculateStoreStatus(state.currentStore);
        useStoreStatusStore.setState({ status: newStatus });
      }
    }, 60_000);

    useStoreStatusStore.setState({ intervalId: interval });

    return () => {
      clearInterval(interval);
      useStoreStatusStore.setState({ intervalId: null });
    };
  }, []);

  // Realtime
  useEffect(() => {
    if (!store?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`store-status-${store.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stores",
          filter: `id=eq.${store.id}`,
        },
        async () => {
          // Busca dados completos quando há update
          const { data: freshStore, error } = await supabase
            .from("stores")
            .select("*, store_hours(*), shippings(*)")
            .eq("id", store.id)
            .single();

          if (error) {
            console.error("Erro ao buscar store atualizada:", error);
            return;
          }

          if (freshStore) {
            const newStatus = calculateStoreStatus(freshStore as Store);
            useStoreStatusStore.setState({
              currentStore: freshStore as Store,
              status: newStatus,
            });
          }
        },
      )
      .subscribe();

    useStoreStatusStore.setState({ supabaseChannel: channel });

    return () => {
      supabase.removeChannel(channel);
      useStoreStatusStore.setState({ supabaseChannel: null });
    };
  }, [store?.id]);
}
