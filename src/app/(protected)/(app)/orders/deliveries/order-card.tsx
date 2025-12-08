import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { statuses } from "@/models/statuses";
import { ChevronRight } from "lucide-react";

import Link from "next/link";
import { OrderOptions } from "./data-table/options";
import { Order } from "@/features/admin/orders/schemas";

type OrderCardPropsType = {
  order: Order;
};

type StatusKey = keyof typeof statuses;

export function OrderCard({ order }: OrderCardPropsType) {
  const isIfood = order.is_ifood;

  const customer = isIfood
    ? order.ifood_order_data?.customer
    : order.store_customers?.customers;
  const customerNames = customer?.name.split(" ");
  const firstName = customerNames && customerNames[0];

  const displayId = order.display_id ?? order.id.substring(0, 4);

  return (
    <Card key={order.id} className={cn("flex flex-col gap-2 p-4")}>
      <Link
        href={`orders/deliveries/${order.id}`}
        className="flex flex-col gap-2"
      >
        <>
          <header className="flex flex-row">
            <Badge className={cn(statuses[order.status as StatusKey].color)}>
              {statuses[order.status as StatusKey].status}
            </Badge>

            <span className="text-muted-foreground ml-2">#{displayId}</span>

            <span
              className={cn(
                "text-xs text-muted-foreground ml-auto whitespace-nowrap",
                order.status === "accept" && "text-muted",
              )}
            >
              {formatDate(order.created_at, "dd/MM hh:mm")}
            </span>

            <ChevronRight className="w-4 h-4 ml-2" />
          </header>

          <strong>{`${firstName}`}</strong>

          <section
            className={cn(
              "pr-1 text-xs space-y-1 text-muted-foreground",
              order.status === "accept" && "bg-primary text-primary-foreground",
            )}
          >
            <div className="flex flex-row justify-between">
              <span>{order.order_items?.length} produto(s)</span>
              <strong>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(order?.total?.total_amount ?? 0)}
              </strong>
            </div>
          </section>
        </>
      </Link>
      <footer className="flex justify-end mt-2 border-t pt-2">
        <OrderOptions order={order} />
      </footer>
    </Card>
  );
}
