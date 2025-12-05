"use client";

import { buttonVariants } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { OrderType } from "@/models/order";
import { Edit } from "lucide-react";
import Link from "next/link";

export function EditButton({ order }: { order: OrderType }) {
  const isMobile = useIsMobile();

  const currentStatus = order?.status;

  const accepted = currentStatus !== "accept";
  const isPaid = order.is_paid;

  return (
    <>
      {accepted && !isPaid && (
        <Link
          href={`/orders/deliveries/register?order_id=${order?.id}`}
          className={buttonVariants({
            variant: "ghost",
            size: isMobile ? "default" : "icon",
          })}
        >
          <Edit className="w-5 h-5" />
          {isMobile && "Editar"}
        </Link>
      )}
    </>
  );
}
