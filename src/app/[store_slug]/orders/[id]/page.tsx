import { CopyTextButton } from '@/components/copy-text-button'

import { Card } from '@/components/ui/card'
import { readOrderById } from '@/features/store/orders/read-by-id'
import { readStoreBySlug } from '@/features/store/store/read'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { Banknote, CreditCard } from 'lucide-react'

import { readCustomer } from '@/features/store/customers/read'
import { formatStoreAddress } from '@/utils/format-address'
import { FaPix } from 'react-icons/fa6'
import { ProductCard } from '../../product-card'
import { Status, StatusKey } from './status'

export default async function OrderPage({
  params,
}: {
  params: { store_slug: string; id: string }
}) {
  const [[storeData], [orderData], [customerData]] = await Promise.all([
    readStoreBySlug({ storeSlug: params.store_slug }),
    readOrderById({ orderId: params.id }),
    readCustomer({}),
  ])

  const store = storeData?.store
  const storeAddress = store?.address
  const order = orderData?.order
  const address = order?.delivery.address
  const customer = customerData?.customer

  const total = order?.total
  const discount = total?.discount
  const currentStatus = statuses[order?.status as StatusKey]
  const shippingPrice = total?.shipping_price ?? 0
  const subtotal = total?.subtotal ?? 0

  const paymentType = order?.payment_type
  const totalAmount = total?.total_amount ?? 0
  const changeValue = total?.change_value ?? 0

  const PAYMENT_METHODS = {
    CREDIT: {
      label: 'com cartão de crédito',
      description: 'Você poderá pagar com um cartão de crédito.',
    },
    DEBIT: {
      label: 'com cartão de débito',
      description: 'Você poderá pagar com um cartão de débito.',
    },
    CASH: {
      label: `em dinheiro ${changeValue ? ' - troco para ' + formatCurrencyBRL(changeValue) : ''}`,
      description: `Você deverá efetuar o pagamento no momento da ${order?.type === 'DELIVERY' ? 'entrega.' : 'retirada.'}`,
    },
    PIX: {
      label: 'com PIX',
      description: store?.pix_key
        ? `A chave PIX da loja é: ${store?.pix_key}`
        : 'Solicite a chave PIX para a loja.',
    },
  }

  const paymentKey = paymentType as keyof typeof PAYMENT_METHODS

  return (
    <section className="flex flex-col items-center justify-center gap-4 p-4 pb-24 mt-[68px]">
      {order && (
        <div className="flex flex-col gap-2 text-sm w-full max-w-lg">
          <Status order={order} customer={customer} />

          {order.type === 'DELIVERY' && (
            <Card className="p-4">
              <p>
                <span className="text-muted-foreground">
                  {currentStatus.delivery_address} em:
                </span>
                <br />
                <strong className="text-lg">{formatAddress(address)}</strong>
              </p>
            </Card>
          )}

          {order.type === 'TAKEOUT' && (
            <Card className="p-4">
              <p>
                <span className="text-muted-foreground">
                  Retire seu pedido na
                </span>{' '}
                <strong>
                  {storeAddress && formatStoreAddress(storeAddress)}
                </strong>
              </p>
            </Card>
          )}

          <Card className="flex flex-col items-center gap-2 text-center py-6">
            {paymentType === 'CREDIT' && <CreditCard className="w-6 h-6" />}
            {paymentType === 'DEBIT' && <CreditCard className="w-6 h-6" />}
            {paymentType === 'CASH' && <Banknote className="w-6 h-6" />}
            {paymentType === 'PIX' && <FaPix className="w-6 h-6" />}
            <p>
              Você pagará{' '}
              <strong className="text-primary">
                {formatCurrencyBRL(totalAmount)}
              </strong>{' '}
              {PAYMENT_METHODS[paymentKey]?.label}
            </p>
            {paymentKey === 'PIX' && store?.pix_key ? (
              <div>
                <CopyTextButton
                  textToCopy={store?.pix_key}
                  buttonText="Chave PIX"
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                {PAYMENT_METHODS[paymentKey]?.description}
              </span>
            )}
          </Card>

          <Card className="p-4">
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">
                Produtos({order.order_items.length})
              </span>
              <span>{formatCurrencyBRL(subtotal ?? 0)}</span>
            </p>
            {shippingPrice ? (
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span>
                  {shippingPrice > 0
                    ? formatCurrencyBRL(shippingPrice)
                    : 'Grátis'}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground">Retirar pedido na loja</p>
            )}
            {discount && discount < 0 ? (
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">Desconto</span>
                <span>{formatCurrencyBRL(discount)}</span>
              </p>
            ) : null}
            <p className="flex flex-row items-center justify-between">
              <span className="text-xl">Total</span>
              <strong className="text-xl">
                {formatCurrencyBRL(order?.total?.total_amount)}
              </strong>
            </p>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            {order.order_items
              .filter((item) => item.product_id)
              .map((item) => (
                <ProductCard
                  key={item.id}
                  data={item.products}
                  variant="bag_items"
                  observations={item.observations}
                  extras={item.extras}
                  quantity={item.quantity}
                  storeSubdomain={params.store_slug}
                />
              ))}
          </Card>
        </div>
      )}
    </section>
  )
}
