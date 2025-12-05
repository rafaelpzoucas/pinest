"use client";

import { useEffect } from "react";
import { useServerAction } from "zsa-react";
import { updateOrderPrintedItems } from "../actions";

export function Printer({ orderId }: { orderId: string }) {
  const { execute } = useServerAction(updateOrderPrintedItems, {
    onSuccess: () => {
      window.location.href = `/orders/deliveries/${orderId}/receipt/delivery`;
    },
  });

  useEffect(() => {
    window.onafterprint = () => {
      execute({ orderId });
    };

    window.print();

    return () => {
      window.onafterprint = null;
    };
  }, [orderId]);

  return null;
}
