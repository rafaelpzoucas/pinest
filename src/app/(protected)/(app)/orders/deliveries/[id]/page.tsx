"use client";

import { AdminHeader } from "@/app/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatAddress, formatCurrencyBRL } from "@/lib/utils";
import { statuses } from "@/models/statuses";
import { addHours, format } from "date-fns";
import { Plus } from "lucide-react";
import Image from "next/image";
import { OrderOptions } from "../data-table/options";
// ATENÇÃO: Não usar versão cacheada, pois esta tela depende de tempo real
import { useOrderById } from "@/features/admin/orders/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { IfoodOrderData } from "@/features/admin/orders/schemas";
import { IfoodItem } from "@/features/admin/integrations/ifood/schemas";
import { useParams } from "next/navigation";
import { CopyPhoneButton } from "@/components/copy-phone-button";

type StatusKey = keyof typeof statuses;

export default async function OrderPage() {
  const params = useParams();

  const orderId = params.id as string;

  const { data: order, isLoading, error } = useOrderById(orderId);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-4 p-4 lg:px-0 pb-16">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="flex flex-col gap-4 p-4">
        <AdminHeader title="Pedido não encontrado" withBackButton />
        <p className="text-muted-foreground">
          Não foi possível carregar os detalhes do pedido.
        </p>
      </section>
    );
  }

  const displayId = order.display_id ?? orderId.substring(0, 4);
  const isIfood = order?.is_ifood;
  const ifoodOrderData: IfoodOrderData = isIfood && order?.ifood_order_data;
  const ifoodItems: IfoodItem[] = ifoodOrderData?.items;
  const ifoodAddress = ifoodOrderData?.delivery?.deliveryAddress;

  const orderItems = order?.order_items;
  const customer = order?.store_customers?.customers;
  const customerAddress = !isIfood
    ? formatAddress(order?.store_customers?.customers?.address)
    : `${ifoodAddress?.streetName}, ${ifoodAddress?.streetNumber}`;

  const variations = order?.order_item_variations;

  const ifoodItemsTotal = (isIfood && ifoodOrderData?.total.subTotal) || 0;
  const ifoodAdditionalFees = isIfood && ifoodOrderData?.total.additionalFees;
  const PAYMENT_TYPES = {
    CREDIT: "Cartão de crédito",
    DEBIT: "Cartão de débito",
    CASH: "Dinheiro",
    PIX: "PIX",
    ONLINE: "Pago online",
  } as const;

  type PaymentTypes = keyof typeof PAYMENT_TYPES;

  const ifoodPaymentType: PaymentTypes = ifoodOrderData?.payments?.methods[0]
    ?.method as PaymentTypes;
  const ifoodCashChangeAmount =
    ifoodOrderData?.payments?.methods[0]?.cash?.changeFor &&
    ifoodOrderData?.payments?.methods[0]?.cash?.changeFor -
      (order?.total?.total_amount || 0);

  const deliveryDateTime = addHours(
    ifoodOrderData?.delivery?.deliveryDateTime,
    3,
  );
  const preparationStartDateTime = addHours(
    ifoodOrderData?.preparationStartDateTime,
    3,
  );

  const subTotal = isIfood ? ifoodItemsTotal : order?.total?.subtotal || 0;
  const change =
    (order?.total?.change_value || 0) - (order?.total?.total_amount || 0);

  return (
    <section className="flex flex-col gap-4 p-4 lg:px-0 pb-16">
      <AdminHeader title={`Detalhes: #${displayId}`} withBackButton />

      <div className="flex flex-col lg:grid grid-cols-2 items-start gap-6">
        <div className="flex flex-col gap-4 w-full">
          <Card className="flex flex-col items-start w-full gap-4 p-4">
            <header className="flex flex-row items-center justify-between w-full">
              <Badge className={cn(statuses[order?.status as StatusKey].color)}>
                {statuses[order?.status as StatusKey].status}
              </Badge>

              <div className="hidden lg:block">
                <OrderOptions order={order} />
              </div>
            </header>

            <p>{statuses[order?.status as StatusKey].next_step}</p>

            <div className="flex flex-row gap-3">
              <div className="flex flex-row items-center gap-2">
                <span>
                  {isIfood && (
                    <Image src="/ifood.png" alt="" width={40} height={20} />
                  )}
                </span>
              </div>

              {ifoodOrderData &&
                preparationStartDateTime &&
                ifoodOrderData.orderTiming === "SCHEDULED" && (
                  <div className="flex flex-row gap-2">
                    <Badge className="flex flex-col w-fit text-base">
                      <span>AGENDADO</span>
                      <span>{format(deliveryDateTime, "dd/MM HH:mm")}</span>
                    </Badge>
                    <Badge className="flex flex-col w-fit text-base bg-secondary text-secondary-foreground">
                      <span>INICIAR PREPARO</span>
                      <span>
                        {format(preparationStartDateTime, "dd/MM HH:mm")}
                      </span>
                    </Badge>
                  </div>
                )}
            </div>

            <div>
              <strong>Forma de pagamento</strong>

              <p>
                <Badge className="text-lg" variant="secondary">
                  {PAYMENT_TYPES[ifoodPaymentType ?? order?.payment_type]}
                  {isIfood && ifoodOrderData.payments.methods[0].card?.brand
                    ? ` - ${ifoodOrderData.payments.methods[0].card?.brand}`
                    : ""}
                </Badge>
              </p>
            </div>

            <footer className="flex flex-col gap-2 border-t pt-2 w-full">
              <div className="flex flex-row items-center justify-between text-sm w-full">
                <strong>Subtotal</strong>
                <strong>{formatCurrencyBRL(subTotal ?? 0)}</strong>
              </div>

              {ifoodAdditionalFees && (
                <div className="flex flex-row items-center justify-between text-sm w-full">
                  <strong>Taxas adicionais</strong>
                  <strong>{formatCurrencyBRL(ifoodAdditionalFees ?? 0)}</strong>
                </div>
              )}

              {order.type === "DELIVERY" && (
                <div className="flex flex-row items-center justify-between text-sm w-full">
                  <strong>Entrega</strong>
                  <strong>
                    {formatCurrencyBRL(order?.total?.shipping_price || 0)}
                  </strong>
                </div>
              )}

              {isIfood && ifoodOrderData.payments.methods[0].cash && (
                <div className="flex flex-row items-center justify-between text-sm w-full">
                  <strong>Troco</strong>
                  <strong>
                    {formatCurrencyBRL(ifoodCashChangeAmount ?? 0)}
                  </strong>
                </div>
              )}

              {!isIfood &&
                order.payment_type === "CASH" &&
                order?.total?.change_value && (
                  <div className="flex flex-row items-center justify-between text-sm w-full">
                    <strong>Troco</strong>
                    <strong>{formatCurrencyBRL(change ?? 0)}</strong>
                  </div>
                )}

              {isIfood && ifoodOrderData.benefits && (
                <p className="flex flex-row items-center justify-between">
                  <span>
                    Desconto: (
                    {ifoodOrderData.benefits[0].sponsorshipValues[0].name})
                  </span>{" "}
                  <span>
                    {formatCurrencyBRL(ifoodOrderData.benefits[0].value)}
                  </span>
                </p>
              )}

              {order?.total?.discount ? (
                <div className="flex flex-row items-center justify-between text-sm w-full">
                  <strong>Desconto</strong>
                  <strong>
                    {formatCurrencyBRL(order.total.discount * -1)}
                  </strong>
                </div>
              ) : null}

              <div className="flex flex-row items-center justify-between text-sm w-full">
                <strong>Total da venda</strong>
                <strong>
                  {formatCurrencyBRL(order?.total?.total_amount ?? 0)}
                </strong>
              </div>

              {ifoodOrderData?.customer?.documentNumber && (
                <strong className="text-sm w-full border-t pt-2">
                  Incluir CPF na nota fiscal:{" "}
                  {ifoodOrderData.customer.documentNumber}
                </strong>
              )}

              <div className="lg:hidden flex justify-end mt-2 pt-2 border-t w-full">
                <OrderOptions order={order} />
              </div>
            </footer>
          </Card>

          <Card className="p-4">
            <section className="flex flex-col gap-2">
              <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

              <div className="flex flex-col gap-2">
                {!isIfood &&
                  orderItems &&
                  orderItems.length > 0 &&
                  orderItems.map((item) => {
                    // Calculando o total do item (produto base)
                    const itemTotal = item.product_price;

                    // Calculando o total dos extras
                    const extrasTotal = item.extras.reduce((acc, extra) => {
                      return acc + extra.price * extra.quantity;
                    }, 0);

                    // Somando o total do item com o total dos extras
                    const total = (itemTotal + extrasTotal) * item.quantity;

                    if (!item?.products) {
                      return null;
                    }

                    const observations =
                      item.observations &&
                      item.observations.length > 0 &&
                      item.observations.filter((obs) => obs !== "");

                    return (
                      <Card key={item.id} className="p-4 space-y-2">
                        <header className="flex flex-row items-start justify-between gap-4 text-sm">
                          <strong className="line-clamp-2 uppercase">
                            {item.quantity} un. {item?.products?.name}
                          </strong>
                          <span>
                            {formatCurrencyBRL(item?.products?.price)}
                          </span>
                        </header>

                        {item.extras.length > 0 &&
                          item.extras.map((extra) => (
                            <p
                              key={extra.id}
                              className="flex flex-row items-center justify-between w-full text-muted-foreground"
                            >
                              <span className="flex flex-row items-center">
                                <Plus className="w-3 h-3 mr-1" />{" "}
                                {extra.quantity} ad. {extra.name}
                              </span>
                              <span>
                                {formatCurrencyBRL(
                                  extra.price * extra.quantity,
                                )}
                              </span>
                            </p>
                          ))}

                        <div className="flex flex-col">
                          {observations &&
                            observations.length > 0 &&
                            observations.map((obs) => (
                              <strong className="uppercase text-muted-foreground">
                                obs: {obs}
                              </strong>
                            ))}
                        </div>

                        <div>
                          {variations &&
                            variations.map((variation) => (
                              <Badge key={variation.id} className="mr-2">
                                {variation.product_variations.name}
                              </Badge>
                            ))}
                        </div>

                        <footer className="flex flex-row items-center justify-between">
                          <p>Total:</p>
                          <span>{formatCurrencyBRL(total)}</span>{" "}
                          {/* Exibindo o total calculado */}
                        </footer>
                      </Card>
                    );
                  })}

                {isIfood &&
                  ifoodItems &&
                  ifoodItems.length > 0 &&
                  ifoodItems.map((item) => {
                    // Calculando o total do item (produto base)
                    const itemTotal = item.totalPrice;

                    // Calculando o total dos extras
                    const optionsTotal = item.options
                      ? item.options.reduce((acc, option) => {
                          return acc + option.price * option.quantity;
                        }, 0)
                      : 0;

                    // Somando o total do item com o total dos options
                    const total = (itemTotal + optionsTotal) * item.quantity;

                    return (
                      <Card key={item.id} className="p-4 space-y-2">
                        <header className="flex flex-row items-start justify-between gap-4 text-sm">
                          <strong className="line-clamp-2 uppercase">
                            {item.quantity} un. {item?.name}
                          </strong>
                          <span>{formatCurrencyBRL(item?.price)}</span>
                        </header>

                        {item.options &&
                          item.options.length > 0 &&
                          item.options.map((option) => (
                            <p
                              key={option.id}
                              className="flex flex-row items-center justify-between w-full text-muted-foreground"
                            >
                              <span className="flex flex-row items-center">
                                <Plus className="w-3 h-3 mr-1" />{" "}
                                {option.quantity} ad. {option.name}
                              </span>
                              <span>
                                {formatCurrencyBRL(
                                  option.price * option.quantity,
                                )}
                              </span>
                            </p>
                          ))}

                        {item.observations && (
                          <strong className="uppercase text-muted-foreground">
                            obs: {item.observations}
                          </strong>
                        )}

                        <div>
                          {variations &&
                            variations.map((variation) => (
                              <Badge key={variation.id} className="mr-2">
                                {variation.product_variations.name}
                              </Badge>
                            ))}
                        </div>

                        <footer className="flex flex-row items-center justify-between">
                          <p>Total:</p>
                          <span>{formatCurrencyBRL(total)}</span>{" "}
                          {/* Exibindo o total calculado */}
                        </footer>
                      </Card>
                    );
                  })}
              </div>
            </section>
          </Card>
        </div>

        <Card className="space-y-6 p-4">
          <header className="flex flex-row gap-4">
            <div className="flex flex-col gap-1">
              <strong>{customer?.name}</strong>

              {customer?.phone && (
                <p className="text-muted-foreground">
                  Telefone: <CopyPhoneButton phone={customer?.phone} />
                </p>
              )}

              <span>
                <p className="">
                  {order.type === "DELIVERY"
                    ? `Entregar no endereço: ${customerAddress}`
                    : "Retirada na loja"}
                </p>
              </span>
            </div>
          </header>

          {isIfood && ifoodOrderData?.delivery?.observations && (
            <div>
              <p>OBS: {ifoodOrderData?.delivery?.observations}</p>
            </div>
          )}

          {isIfood && ifoodOrderData?.extraInfo && (
            <div>
              <p>Informações adicionais: {ifoodOrderData?.extraInfo}</p>
            </div>
          )}

          {isIfood && ifoodOrderData?.delivery?.pickupCode && (
            <div>
              <p>Código de coleta: {ifoodOrderData?.delivery?.pickupCode}</p>
            </div>
          )}

          {/* <Tracking
              code={order.tracking_code}
              storeId={order.store_id}
            /> */}
        </Card>
      </div>
    </section>
  );
}
