// components/store-status-initializer.tsx
"use client";

import { useEffect, useRef } from "react";
import type { StoreStatus } from "@/app/[store_slug]/(status)/calculate";
import type { Store } from "@/features/store/initial-data/schemas";
import { createClient } from "@/lib/supabase/client";
import { useStoreStatusStore } from "@/stores/store-status";

interface StoreStatusInitializerProps {
  store: Store;
  initialStatus: StoreStatus;
}

export function StoreStatusInitializer({
  store,
  initialStatus,
}: StoreStatusInitializerProps) {
  const isInitialized = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: no needed
  useEffect(() => {
    if (isInitialized.current) return;

    // Inicializa a store com os dados do servidor
    useStoreStatusStore.setState({
      status: initialStatus,
      currentStore: store,
      enableRealTime: true,
      enableRealtimeSubscription: true,
    });

    isInitialized.current = true;
  }, [store.id, initialStatus]);

  // Polling effect
  useEffect(() => {
    const updateStatus = () => {
      const state = useStoreStatusStore.getState();
      if (state.currentStore) {
        // Aqui você precisa importar calculateStoreStatus
        import("@/app/[store_slug]/(status)/calculate").then(
          ({ calculateStoreStatus }) => {
            const newStatus = calculateStoreStatus(state.currentStore);
            useStoreStatusStore.setState({ status: newStatus });
          },
        );
      }
    };

    const interval = setInterval(updateStatus, 60_000);
    useStoreStatusStore.setState({ intervalId: interval });

    return () => {
      clearInterval(interval);
      useStoreStatusStore.setState({ intervalId: null });
    };
  }, []);

  // Realtime subscription effect
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
        (payload) => {
          // Atualiza com os dados do payload
          import("@/app/[store_slug]/(status)/calculate").then(
            ({ calculateStoreStatus }) => {
              const freshStore = payload.new as Store;
              useStoreStatusStore.setState({
                currentStore: freshStore,
                status: calculateStoreStatus(freshStore),
              });
            },
          );
        },
      )
      .subscribe();

    useStoreStatusStore.setState({ supabaseChannel: channel });

    return () => {
      supabase.removeChannel(channel);
      useStoreStatusStore.setState({ supabaseChannel: null });
    };
  }, [store.id]);

  return null;
}
