import { AdminHeader } from '@/app/admin-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { IfoodItem, IfoodOrder } from '@/models/ifood'
import { statuses } from '@/models/statuses'
import { addHours, format } from 'date-fns'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { PurchaseOptions } from '../data-table/options'
import { readPurchaseById } from './actions'

type StatusKey = keyof typeof statuses

export default async function OrderPage({
  params,
}: {
  params: { id: string; print: string }
}) {
  const [purchaseData] = await readPurchaseById({ id: params.id })

  const purchase = purchaseData?.purchase

  if (!purchase) {
    return null
  }

  const displayId = params.id.substring(0, 4)
  const isIfood = purchase?.is_ifood
  const ifoodOrderData: IfoodOrder = isIfood && purchase?.ifood_order_data
  const ifoodItems: IfoodItem[] = ifoodOrderData?.items
  const ifoodAddress = ifoodOrderData.delivery.deliveryAddress

  const purchaseItems = purchase?.purchase_items
  const customer = purchase?.store_customers?.customers
  const customerAddress = !isIfood
    ? formatAddress(purchase?.store_customers.customers.address)
    : `${ifoodAddress.streetName}, ${ifoodAddress.streetNumber}`

  const variations = purchase?.purchase_item_variations

  const ifoodItemsTotal = (isIfood && ifoodOrderData?.total.subTotal) || 0
  const ifoodAdditionalFees = isIfood && ifoodOrderData?.total.additionalFees
  const PAYMENT_TYPES = {
    CREDIT: 'Cartão de crédito',
    DEBIT: 'Cartão de débito',
    CASH: 'Dinheiro',
    ONLINE: 'Pago online',
  } as const

  type PaymentTypes = keyof typeof PAYMENT_TYPES

  const ifoodPaymentType: PaymentTypes = ifoodOrderData?.payments?.methods[0]
    ?.type as PaymentTypes
  const ifoodCashChangeAmount =
    ifoodOrderData?.payments?.methods[0]?.cash?.changeFor &&
    ifoodOrderData?.payments?.methods[0]?.cash?.changeFor -
      purchase?.total?.total_amount

  const deliveryDateTime = addHours(
    ifoodOrderData?.delivery?.deliveryDateTime,
    3,
  )
  const preparationStartDateTime = addHours(
    ifoodOrderData?.preparationStartDateTime,
    3,
  )

  const purchaseItemsTotal = purchaseItems.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0,
  )
  const subTotal = isIfood ? ifoodItemsTotal : purchaseItemsTotal
  const change = purchase?.total?.change_value - purchase?.total?.total_amount

  return (
    <section className="flex flex-col gap-4 p-4 lg:px-0">
      <AdminHeader title={`Detalhes: #${displayId}`} withBackButton />

      <div className="flex flex-col lg:grid grid-cols-2 items-start gap-6">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-start w-full gap-4 p-4">
            <header className="flex flex-row items-center justify-between w-full">
              <Badge
                className={cn(statuses[purchase?.status as StatusKey].color)}
              >
                {statuses[purchase?.status as StatusKey].status}
              </Badge>

              <PurchaseOptions
                currentStatus={purchase?.status}
                purchaseId={params.id}
                type={purchase.type}
                isIfood={purchase.is_ifood}
                isDetailsPage
              />
            </header>

            <p>{statuses[purchase?.status as StatusKey].next_step}</p>

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
                ifoodOrderData.orderTiming === 'SCHEDULED' && (
                  <div className="flex flex-row gap-2">
                    <Badge className="flex flex-col w-fit text-base">
                      <span>AGENDADO</span>
                      <span>{format(deliveryDateTime, 'dd/MM HH:mm')}</span>
                    </Badge>
                    <Badge className="flex flex-col w-fit text-base bg-secondary text-secondary-foreground">
                      <span>INICIAR PREPARO</span>
                      <span>
                        {format(preparationStartDateTime, 'dd/MM HH:mm')}
                      </span>
                    </Badge>
                  </div>
                )}
            </div>

            <div>
              <strong>Forma de pagamento</strong>

              <p>
                <span>
                  {PAYMENT_TYPES[ifoodPaymentType ?? purchase?.payment_type]}
                  {isIfood &&
                    ` - ${ifoodOrderData.payments.methods[0].card?.brand}`}
                </span>
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

              {isIfood && ifoodOrderData.benefits && (
                <p className="flex flex-row items-center justify-between">
                  <span>
                    Desconto: (
                    {ifoodOrderData.benefits[0].sponsorshipValues[0].name})
                  </span>{' '}
                  <span>
                    {formatCurrencyBRL(ifoodOrderData.benefits[0].value)}
                  </span>
                </p>
              )}

              {purchase.type === 'DELIVERY' && (
                <div className="flex flex-row items-center justify-between text-sm w-full">
                  <strong>Entrega</strong>
                  <strong>
                    {formatCurrencyBRL(purchase?.total.shipping_price ?? 0)}
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
                purchase.payment_type === 'CASH' &&
                purchase.total.change_value && (
                  <div className="flex flex-row items-center justify-between text-sm w-full">
                    <strong>Troco</strong>
                    <strong>{formatCurrencyBRL(change ?? 0)}</strong>
                  </div>
                )}

              <div className="flex flex-row items-center justify-between text-sm w-full">
                <strong>Total da venda</strong>
                <strong>
                  {formatCurrencyBRL(purchase?.total.total_amount ?? 0)}
                </strong>
              </div>

              {ifoodOrderData.customer.documentNumber && (
                <strong className="text-sm w-full border-t pt-2">
                  Incluir CPF na nota fiscal:{' '}
                  {ifoodOrderData.customer.documentNumber}
                </strong>
              )}
            </footer>
          </Card>

          <Card className="p-4">
            <section className="flex flex-col gap-2">
              <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

              <div className="flex flex-col gap-2">
                {!isIfood &&
                  purchaseItems &&
                  purchaseItems.length > 0 &&
                  purchaseItems.map((item) => {
                    // Calculando o total do item (produto base)
                    const itemTotal = item.product_price

                    // Calculando o total dos extras
                    const extrasTotal = item.extras.reduce((acc, extra) => {
                      return acc + extra.price * extra.quantity
                    }, 0)

                    // Somando o total do item com o total dos extras
                    const total = (itemTotal + extrasTotal) * item.quantity

                    if (!item?.products) {
                      return null
                    }

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
                                <Plus className="w-3 h-3 mr-1" />{' '}
                                {extra.quantity} ad. {extra.name}
                              </span>
                              <span>
                                {formatCurrencyBRL(
                                  extra.price * extra.quantity,
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
                          <span>{formatCurrencyBRL(total)}</span>{' '}
                          {/* Exibindo o total calculado */}
                        </footer>
                      </Card>
                    )
                  })}

                {isIfood &&
                  ifoodItems &&
                  ifoodItems.length > 0 &&
                  ifoodItems.map((item) => {
                    // Calculando o total do item (produto base)
                    const itemTotal = item.totalPrice

                    // Calculando o total dos extras
                    const optionsTotal = item.options
                      ? item.options.reduce((acc, option) => {
                          return acc + option.price * option.quantity
                        }, 0)
                      : 0

                    // Somando o total do item com o total dos options
                    const total = (itemTotal + optionsTotal) * item.quantity

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
                                <Plus className="w-3 h-3 mr-1" />{' '}
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
                          <span>{formatCurrencyBRL(total)}</span>{' '}
                          {/* Exibindo o total calculado */}
                        </footer>
                      </Card>
                    )
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
                  Telefone: {customer?.phone}
                </p>
              )}

              <span>
                <p className="">
                  {purchase.type === 'DELIVERY'
                    ? `Entregar no endereço: ${customerAddress}`
                    : 'Retirada na loja'}
                </p>
              </span>
            </div>
          </header>

          {isIfood && ifoodOrderData.delivery.observations && (
            <div>
              <p>OBS: {ifoodOrderData.delivery.observations}</p>
            </div>
          )}

          {isIfood && ifoodOrderData?.extraInfo && (
            <div>
              <p>Informações adicionais: {ifoodOrderData?.extraInfo}</p>
            </div>
          )}

          {isIfood && ifoodOrderData?.delivery.pickupCode && (
            <div>
              <p>Código de coleta: {ifoodOrderData?.delivery.pickupCode}</p>
            </div>
          )}

          {/* <Tracking
              code={purchase.tracking_code}
              storeId={purchase.store_id}
            /> */}
        </Card>
      </div>
    </section>
  )
}
