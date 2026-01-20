"use client";

import { useStoreNotifications } from "@/hooks/useStoreNotifications";
import { createClient } from "@/lib/supabase/client";
import { OrderType } from "@/models/order";
import { StoreType } from "@/models/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RealtimeNotifications({
  orders,
  store,
}: {
  orders: OrderType[];
  store: StoreType | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [canPlay, setCanPlay] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useStoreNotifications({ storeId: store?.id });

  useEffect(() => {
    const hasPending = orders.some((order) => order.status === "pending");

    // Função que toca o som com debounce
    const playAudio = () => {
      if (!canPlay) return;
      const sound = new Audio("/new-order-notification.mp3");
      sound.play();
      setCanPlay(false);
      timeoutRef.current = setTimeout(() => {
        setCanPlay(true);
      }, 10000);
    };

    let interval: NodeJS.Timeout | null = null;

    if (hasPending) {
      interval = setInterval(playAudio, 10000);
      playAudio();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [orders, canPlay]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return <></>;
}
