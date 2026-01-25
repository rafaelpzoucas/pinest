"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useCashRegister } from "@/stores/cashRegisterStore";
import { BadgeDollarSign, Loader2 } from "lucide-react";
import Link from "next/link";
import { useServerAction } from "zsa-react";
import { closeBills } from "../../close/actions";

import { useQueryState } from "nuqs";
import { OpenCashSession } from "../../../cash-register/open";
import { Order } from "@/features/admin/orders/schemas";

export function CloseSaleButton({ order }: { order: Order }) {
  const [tab] = useQueryState("tab");

  const currentStatus = order?.status;
  const isIfood = order?.is_ifood;

  const accepted = currentStatus !== "pending";
  const delivered = currentStatus === "delivered";
  const isPaid = order.is_paid;

  const { isCashOpen } = useCashRegister();

  const { execute: executeCloseBill, isPending: isCloseBillPending } =
    useServerAction(closeBills);

  if (!accepted || !delivered || isPaid) {
    return null;
  }

  if (!isCashOpen) {
    return <OpenCashSession />;
  }

  if (isIfood) {
    return (
      <Button onClick={() => executeCloseBill({ order_id: order.id })}>
        {isCloseBillPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fechando...</span>
          </>
        ) : (
          <>
            <BadgeDollarSign className="w-5 h-5" />
            <span>Fechar venda</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Link
      href={
        isCashOpen
          ? `/orders/close?order_id=${order.id}&tab=${tab ?? "deliveries"}`
          : "/cash-register"
      }
      className={buttonVariants({
        variant: "default",
      })}
    >
      <BadgeDollarSign className="w-5 h-5" />
      <span>Fechar venda</span>
    </Link>
  );
}
