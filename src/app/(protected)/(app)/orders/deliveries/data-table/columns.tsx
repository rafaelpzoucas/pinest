"use client";
import { Badge } from "@/components/ui/badge";
import { formatAddress, formatCurrencyBRL, formatDate } from "@/lib/utils";
import { statuses } from "@/models/statuses";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { OrderOptions } from "./options";
import { Order } from "@/features/admin/orders/schemas";

export type StatusKey = keyof typeof statuses;

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "display_id",
    header: "ID",
    cell: ({ row }) => `#${row.getValue("display_id") ?? ""}`,
    meta: { clickable: true },
  },
  {
    accessorKey: "created_at",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return formatDate(date, "dd/MM - HH:mm:ss");
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const order = row.original;
      const isIfood = order.is_ifood;
      const ifoodOrderData = isIfood ? order.ifood_order_data : null;
      const deliveryDateTime = ifoodOrderData?.delivery?.deliveryDateTime;
      const preparationStartDateTime = ifoodOrderData?.preparationStartDateTime;
      const orderTiming = ifoodOrderData?.orderTiming;

      return (
        <div className="flex flex-col gap-3 items-center justify-center">
          <div className="flex flex-row items-center gap-2">
            <span>
              {isIfood && (
                <Image src="/ifood.png" alt="" width={30} height={15} />
              )}
            </span>
            <span>{order.type === "DELIVERY" ? "Entrega" : "Retirada"}</span>
          </div>
          {ifoodOrderData &&
            preparationStartDateTime &&
            orderTiming === "SCHEDULED" &&
            deliveryDateTime && (
              <div className="flex flex-row gap-2">
                <Badge className="flex flex-col w-fit">
                  <span>AGENDADO</span>
                  <span>
                    {format(new Date(deliveryDateTime), "dd/MM HH:mm")}
                  </span>
                </Badge>
                <Badge className="flex flex-col w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
                  <span>INICIAR PREPARO</span>
                  <span>
                    {format(new Date(preparationStartDateTime), "dd/MM HH:mm")}
                  </span>
                </Badge>
              </div>
            )}
        </div>
      );
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "store_customers",
    header: "Cliente",
    cell: ({ row }) => {
      const order = row.original;
      const isIfood = order.is_ifood;

      const customer = isIfood
        ? order.ifood_order_data?.customer
        : order.store_customers?.customers;

      const type = order.type;

      const customerAddress = isIfood
        ? (order.delivery?.address as string)
        : formatAddress(order.store_customers?.customers?.address);

      const customerName = customer?.name?.toLowerCase() || "Cliente";

      return (
        <div className="max-w-[280px]">
          <p className="capitalize">{customerName}</p>
          <p className="text-xs text-muted-foreground">
            {type === "DELIVERY" ? customerAddress : "Retirada na loja"}
          </p>
        </div>
      );
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const isPaid = row.original.is_paid;
      const cancelled = status === "cancelled";
      return (
        <Badge variant="secondary" className="hover:bg-secondary">
          {statuses[status as StatusKey].status}{" "}
          {!cancelled && isPaid ? " - Pago" : ""}
        </Badge>
      );
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "change_value",
    header: "Troco",
    cell: ({ row }) => {
      const order = row.original;
      const isIfood = order.is_ifood;
      const changeValue = order.total?.change_value ?? 0;
      const totalAmount = order.total?.total_amount ?? 0;

      const ifoodOrderData = isIfood ? order.ifood_order_data : null;
      const ifoodCashChangeAmount =
        ifoodOrderData?.payments?.methods?.[0]?.cash?.changeFor ?? 0;

      const finalChangeValue = ifoodCashChangeAmount || changeValue;

      return finalChangeValue ? (
        formatCurrencyBRL(finalChangeValue - totalAmount)
      ) : (
        <p>-</p>
      );
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "discount",
    header: "Desconto",
    cell: ({ row }) => {
      const discount = row.original.total?.discount;
      return discount ? formatCurrencyBRL(discount * -1) : <p>-</p>;
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const totalAmount = row.original.total?.total_amount ?? 0;
      return (
        <div>
          <p>{formatCurrencyBRL(totalAmount)}</p>
        </div>
      );
    },
    meta: { clickable: true },
  },
  {
    accessorKey: "id",
    header: "Ações",
    cell: ({ row }) => {
      return <OrderOptions order={row.original} />;
    },
  },
];
