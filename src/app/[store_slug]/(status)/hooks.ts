import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStoreStatusStore } from "@/stores/store-status";

export function useStoreStatus() {
  const store = useStoreStatusStore();

  return {
    // Estado
    currentStore: store.currentStore,
    status: store.status,
    isLoading: store.isLoading,
    error: store.error,

    // Configurações
    enableRealTime: store.enableRealTime,
    enableRealtimeSubscription: store.enableRealtimeSubscription,

    // Actions
    setStore: store.setStore,
    updateStatus: store.updateStatus,
    setRealTimeEnabled: store.setRealTimeEnabled,
    setRealtimeSubscriptionEnabled: store.setRealtimeSubscriptionEnabled,
    reset: store.reset,
    getStoreStatus: store.getStoreStatus,
  };
}

// Hook para efeitos (pode ser usado em componentes que precisam dos side effects)
export function useStoreStatusEffects() {
  const {
    currentStore,
    enableRealTime,
    enableRealtimeSubscription,
    updateStatus,
    setRealTimeEnabled,
    setRealtimeSubscriptionEnabled,
  } = useStoreStatus();

  useEffect(() => {
    if (!enableRealTime) return;

    const interval = setInterval(updateStatus, 60_000);
    useStoreStatusStore.setState({ intervalId: interval });

    return () => {
      clearInterval(interval);
      useStoreStatusStore.setState({ intervalId: null });
    };
  }, [enableRealTime, updateStatus]);

  useEffect(() => {
    if (!enableRealtimeSubscription || !currentStore?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`store-status-${currentStore.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stores",
          filter: `id=eq.${currentStore.id}`,
        },
        () => {
          updateStatus();
        },
      )
      .subscribe();

    useStoreStatusStore.setState({ supabaseChannel: channel });

    return () => {
      supabase.removeChannel(channel);
      useStoreStatusStore.setState({ supabaseChannel: null });
    };
  }, [enableRealtimeSubscription, currentStore?.id, updateStatus]);

  return {
    setRealTimeEnabled,
    setRealtimeSubscriptionEnabled,
  };
}
