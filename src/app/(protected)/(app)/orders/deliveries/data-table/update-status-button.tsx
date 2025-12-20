"use client";

import { nofityCustomer } from "@/actions/admin/notifications/actions";
import { Button } from "@/components/ui/button";
import { statuses } from "@/models/statuses";
import { Check, FastForward, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { printOrderReceipt } from "../../../config/printing/actions";
import { acceptOrder, updateOrderStatus } from "../[id]/actions";
import { Order } from "@/features/admin/orders/schemas";
import { ordersKeys } from "@/features/admin/orders/hooks";

type StatusKey = keyof typeof statuses;

export function UpdateStatusButton({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const orderId = order?.id;
  const currentStatus = order?.status;
  const isIfood = !!order?.is_ifood;
  const type = order?.type;
  const accepted = currentStatus !== "accept";
  const customerPhone = order.store_customers?.customers?.phone;

  const printReceiptMutation = useMutation({
    mutationFn: async (params: Parameters<typeof printOrderReceipt>[0]) => {
      const [data, error] = await printOrderReceipt(params);
      if (error) throw error;
      return data;
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (params: Parameters<typeof acceptOrder>[0]) => {
      const [data, error] = await acceptOrder(params);
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await printReceiptMutation.mutateAsync({
        orderId: order.id,
        orderType: order.type,
        reprint: false,
      });

      await nofityCustomer({
        title: "O seu pedido foi aceito!",
        customerPhone,
        url: `/orders/${order.id}`,
      });

      // Invalida queries relacionadas ao pedido
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.open });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (params: Parameters<typeof updateOrderStatus>[0]) => {
      const [data, error] = await updateOrderStatus(params);
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await nofityCustomer({
        title: statuses[currentStatus as StatusKey].next_step as string,
        customerPhone,
        url: `/orders/${order.id}`,
      });

      // Invalida queries relacionadas ao pedido
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.open });
    },
  });

  async function handleUpdateStatus(status: string) {
    if (!accepted) {
      await acceptOrderMutation.mutateAsync({ orderId });
      return;
    }

    const newStatus =
      status === "shipped" && type === "TAKEOUT" ? "readyToPickup" : status;

    await updateStatusMutation.mutateAsync({ newStatus, orderId, isIfood });
  }

  if (currentStatus === "delivered" || currentStatus === "cancelled") {
    return null;
  }

  const isLoading =
    acceptOrderMutation.isPending || updateStatusMutation.isPending;

  return (
    <Button
      onClick={() =>
        handleUpdateStatus(
          statuses[currentStatus as StatusKey].next_status as string,
        )
      }
      disabled={isLoading}
    >
      {!accepted ? (
        <>
          {acceptOrderMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Confirmando...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Confirmar</span>
            </>
          )}
        </>
      ) : updateStatusMutation.isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando...</span>
        </>
      ) : (
        <>
          <span>
            {statuses[currentStatus as StatusKey]?.action_text as string}
          </span>
          <FastForward className="w-5 h-5" />
        </>
      )}
    </Button>
  );
}
