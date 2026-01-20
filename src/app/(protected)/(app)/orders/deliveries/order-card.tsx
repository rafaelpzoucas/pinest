import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatAddress, formatCurrencyBRL, formatDate } from "@/lib/utils";
import { statuses } from "@/models/statuses";
import { ChevronRight } from "lucide-react";

import Link from "next/link";
import { OrderOptions } from "./data-table/options";
import {
  IfoodItem,
  IfoodOrderData,
  Order,
} from "@/features/admin/orders/schemas";
import { PAYMENT_TYPES } from "@/models/order";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyPhoneButton } from "@/components/copy-phone-button";
import { CopyTextButton } from "@/components/copy-text-button";
import Image from "next/image";

type OrderCardPropsType = {
  order: Order;
};

type StatusKey = keyof typeof statuses;

export function OrderCard({ order }: OrderCardPropsType) {
  const isIfood = order.is_ifood;
  const ifoodOrderData: IfoodOrderData = isIfood && order?.ifood_order_data;
  const ifoodItems: IfoodItem[] = ifoodOrderData?.items;

  const ifoodItemsTotal = (isIfood && ifoodOrderData?.total.subTotal) || 0;
  const ifoodAdditionalFees = isIfood && ifoodOrderData?.total.additionalFees;

  const customer = isIfood
    ? ifoodOrderData?.customer
    : order.store_customers?.customers;
  const customerNames = customer?.name?.trim().split(" ");
  const firstName = customerNames && customerNames[0];
  const lastName =
    customerNames && customerNames.length > 1
      ? customerNames[customerNames.length - 1]
      : "";
  const customerPhone = isIfood
    ? customer?.phone?.number
    : order.store_customers?.customers?.phone;
  const ifoodCustomerLocalizer = customer?.phone?.localizer;
  const customerAddress = isIfood
    ? (order.delivery?.address as string)
    : formatAddress(order.store_customers?.customers?.address);
  const ifoodPickupCode = ifoodOrderData?.delivery?.pickupCode;

  const displayId = order.display_id ?? order.id.substring(0, 4);

  const isPending = order.status !== "pending";

  return (
    <Card
      key={order.id}
      className={cn(
        "flex flex-col gap-2 p-4",
        !isPending &&
          "bg-green-500/20 hover:bg-green-500/30 border-green-500/30",
      )}
    >
      <>
        <Link
          href={`orders/deliveries/${order.id}`}
          className="flex flex-col gap-2"
        >
          <header className="flex flex-row">
            {isIfood && (
              <Image
                src="/ifood.png"
                alt=""
                width={40}
                height={20}
                className="mr-4"
              />
            )}

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

        <div className="flex flex-col items-start gap-1">
          <strong className="capitalize">{`${firstName} ${lastName}`}</strong>

          {isIfood ? (
            <span className="text-muted-foreground text-xs">
              Telefone: {customerPhone} | Localizador: {ifoodCustomerLocalizer}
            </span>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <CopyPhoneButton phone={customerPhone} variant={"link"} />
              </TooltipTrigger>
              <TooltipContent side="right">Copiar telefone</TooltipContent>
            </Tooltip>
          )}

          {customerAddress && (
            <Tooltip>
              <TooltipTrigger>
                <CopyTextButton
                  textToCopy={customerAddress}
                  buttonText={customerAddress}
                  variant={"link"}
                />
              </TooltipTrigger>
              <TooltipContent side="right">Copiar endereço</TooltipContent>
            </Tooltip>
          )}

          {isIfood && ifoodPickupCode && (
            <div>
              <p>
                Código de coleta:{" "}
                <Badge variant="secondary">{ifoodPickupCode}</Badge>
              </p>
            </div>
          )}
        </div>

        <section
          className={cn("pr-1 text-xs space-y-1 border-t border-dashed pt-2")}
        >
          {/* Renderiza itens normais (não iFood) */}
          {!isIfood &&
            order.order_items?.map((item) => (
              <div className="flex flex-row justify-between" key={item.id}>
                <span>
                  {item.quantity} {item.products?.name ?? "Taxa de entrega"}
                </span>
                <strong>
                  {formatCurrencyBRL(item.product_price * item.quantity || 0)}
                </strong>
              </div>
            ))}

          {/* Renderiza itens do iFood */}
          {isIfood &&
            ifoodItems &&
            ifoodItems.length > 0 &&
            ifoodItems.map((item) => {
              const itemTotal = item.totalPrice;
              const optionsTotal = item.options
                ? item.options.reduce((acc, option) => {
                    return acc + option.price * option.quantity;
                  }, 0)
                : 0;
              const total = (itemTotal + optionsTotal) * item.quantity;

              return (
                <div className="flex flex-row justify-between" key={item.id}>
                  <span>
                    {item.quantity} {item.name}
                  </span>
                  <strong>{formatCurrencyBRL(total)}</strong>
                </div>
              );
            })}

          <div className="flex flex-row justify-between text-base">
            <span>Total:</span>
            <strong>{formatCurrencyBRL(order.total?.total_amount || 0)}</strong>
          </div>
        </section>

        <section
          className={cn(
            "pr-1 text-xs space-y-1 text-muted-foreground border-t border-dashed pt-2",
            !isPending && "border-green-500/30",
          )}
        >
          <span>
            Pagamento via:{" "}
            <Badge variant={"secondary"}>
              {PAYMENT_TYPES[order.payment_type as keyof typeof PAYMENT_TYPES]}
            </Badge>
          </span>
          {order.total?.change_value ? (
            <span>
              Troco para: {formatCurrencyBRL(order.total?.change_value)}
            </span>
          ) : null}
        </section>
      </>
      <footer
        className={cn(
          "flex justify-end border-t pt-2 mt-auto",
          !isPending && "border-green-500/30",
        )}
      >
        <OrderOptions order={order} />
      </footer>
    </Card>
  );
}
