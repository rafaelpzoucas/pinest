import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatAddress, formatCurrencyBRL, formatDate } from "@/lib/utils";
import { statuses } from "@/models/statuses";
import { ChevronRight } from "lucide-react";

import Link from "next/link";
import { OrderOptions } from "./data-table/options";
import { Order } from "@/features/admin/orders/schemas";
import { PAYMENT_TYPES } from "@/models/order";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyPhoneButton } from "@/components/copy-phone-button";
import { CopyTextButton } from "@/components/copy-text-button";

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
  const lastName =
    customerNames && customerNames.length > 1
      ? customerNames[customerNames.length - 1]
      : "";
  const customerPhone = isIfood
    ? order.ifood_order_data.phone
    : order.store_customers?.customers?.phone;
  const customerAddress = isIfood
    ? (order.delivery?.address as string)
    : formatAddress(order.store_customers?.customers?.address);

  const displayId = order.display_id ?? order.id.substring(0, 4);

  const isAccepted = order.status !== "accept";

  return (
    <Card
      key={order.id}
      className={cn(
        "flex flex-col gap-2 p-4",
        !isAccepted &&
          "bg-green-500/20 hover:bg-green-500/30 border-green-500/30",
      )}
    >
      <>
        <Link
          href={`orders/deliveries/${order.id}`}
          className="flex flex-col gap-2"
        >
          <header className="flex flex-row">
            <Badge className={cn(statuses[order.status as StatusKey].color)}>
              {statuses[order.status as StatusKey].status}
            </Badge>

            <span className="text-muted-foreground ml-2">#{displayId}</span>

            <span
              className={cn(
                "text-xs text-muted-foreground ml-auto whitespace-nowrap",
              )}
            >
              {formatDate(order.created_at, "dd/MM hh:mm")}
            </span>

            <ChevronRight className="w-4 h-4 ml-2" />
          </header>
        </Link>

        <div className="flex flex-col items-start">
          <div className="flex flex-row items-center justify-between w-full">
            <strong>{`${firstName} ${lastName}`}</strong>

            <Tooltip>
              <TooltipTrigger>
                <CopyPhoneButton phone={customerPhone} variant={"link"} />
              </TooltipTrigger>
              <TooltipContent>Copiar telefone</TooltipContent>
            </Tooltip>
          </div>
          {customerAddress && (
            <Tooltip>
              <TooltipTrigger>
                <CopyTextButton
                  textToCopy={customerAddress}
                  buttonText={customerAddress}
                  variant={"link"}
                />
              </TooltipTrigger>
              <TooltipContent>Copiar endereço</TooltipContent>
            </Tooltip>
          )}
        </div>

        <section
          className={cn("pr-1 text-xs space-y-1 border-t border-dashed pt-2")}
        >
          {order.order_items?.map((item) => (
            <div className="flex flex-row justify-between" key={item.id}>
              <span>
                {item.quantity} {item.products?.name ?? "Taxa de entrega"}
              </span>
              <strong>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.product_price * item.quantity || 0)}
              </strong>
            </div>
          ))}

          <div className="flex flex-row justify-between text-base">
            <span>Total:</span>
            <strong>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(order.total?.total_amount || 0)}
            </strong>
          </div>
        </section>

        <section
          className={cn(
            "pr-1 text-xs space-y-1 text-muted-foreground border-t border-dashed pt-2",
            !isAccepted && "border-green-500/30",
          )}
        >
          <p>
            Pagamento via:{" "}
            {PAYMENT_TYPES[order.payment_type as keyof typeof PAYMENT_TYPES]}
          </p>
          {order.total?.change_value ? (
            <p>Troco para: {formatCurrencyBRL(order.total?.change_value)}</p>
          ) : null}
        </section>
      </>
      <footer
        className={cn(
          "flex justify-end border-t pt-2 mt-auto",
          !isAccepted && "border-green-500/30",
        )}
      >
        <OrderOptions order={order} />
      </footer>
    </Card>
  );
}
