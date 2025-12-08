"use client";

import { useOrderById } from "@/features/admin/orders/hooks";
import { Info } from "../info";
import { Items } from "./items";
import { Payment } from "./payment";
import { Printer } from "./printer";
import { Total } from "./total";

export default async function PrintDeliveryReceipt({
  params,
}: {
  params: { id: string };
}) {
  const { data: order } = useOrderById(params.id);

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
    >
      <Info order={order} />

      <Items order={order} />

      <Total order={order} />

      <Payment order={order} />

      <Printer />
    </div>
  );
}
