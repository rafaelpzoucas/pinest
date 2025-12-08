"use client";

import { nofityCustomer } from "@/actions/admin/notifications/actions";
import { Button } from "@/components/ui/button";
import { statuses } from "@/models/statuses";
import { Check, FastForward, Loader2 } from "lucide-react";
import { useServerAction } from "zsa-react";
import { printOrderReceipt } from "../../../config/printing/actions";
import { acceptOrder, updateOrderStatus } from "../[id]/actions";
import { Order } from "@/features/admin/orders/schemas";

type StatusKey = keyof typeof statuses;

export function UpdateStatusButton({ order }: { order: Order }) {
  const orderId = order?.id;
  const currentStatus = order?.status;
  const isIfood = !!order?.is_ifood;
  const type = order?.type;

  const accepted = currentStatus !== "accept";

  const customerPhone = order.store_customers?.customers?.phone;

  const { execute: executePrintReceipt } = useServerAction(printOrderReceipt);

  const { execute: executeAccept, isPending: isAcceptPending } =
    useServerAction(acceptOrder, {
      onSuccess: () => {
        executePrintReceipt({
          orderId: order.id,
          orderType: order.type,
          reprint: false,
        });

        nofityCustomer({
          title: "O seu pedido foi aceito!",
          customerPhone,
          url: `/orders/${order.id}`,
        });
      },
    });

  const { execute, isPending } = useServerAction(updateOrderStatus, {
    onSuccess: () => {
      nofityCustomer({
        title: statuses[currentStatus as StatusKey].next_step as string,
        customerPhone,
        url: `/orders/${order.id}`,
      });
    },
  });

  async function handleUpdateStatus(status: string) {
    if (!accepted) {
      await executeAccept({ orderId });
      return;
    }

    const newStatus =
      status === "shipped" && type === "TAKEOUT" ? "readyToPickup" : status;

    await execute({ newStatus, orderId, isIfood });
  }

  if (currentStatus === "delivered" || currentStatus === "cancelled") {
    return null;
  }

  return (
    <Button
      onClick={() =>
        handleUpdateStatus(
          statuses[currentStatus as StatusKey].next_status as string,
        )
      }
      disabled={isAcceptPending || isPending}
    >
      {!accepted ? (
        <>
          {isAcceptPending ? (
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
      ) : isPending ? (
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
