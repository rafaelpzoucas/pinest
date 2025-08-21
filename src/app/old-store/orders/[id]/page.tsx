import { CopyTextButton } from '@/components/copy-text-button'
import { ProductCard } from '@/components/product-card'
import { Header } from '@/components/store-header'
import { Card } from '@/components/ui/card'
import { formatAddress, formatCurrencyBRL, formatDate } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { Banknote, CreditCard, DollarSign } from 'lucide-react'
import { readCustomerCached } from '../../account/actions'
import { readStoreCached } from '../../actions'
import { readOrderById } from './actions'
import { Status, StatusKey } from './status'

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const [[storeData], [orderData], [customerData]] = await Promise.all([
    readStoreCached(),
    readOrderById({ orderId: params.id }),
    readCustomerCached({}),
  ])

  const store = storeData?.store
  const storeAddress = store?.addresses[0]
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
    <section className="flex flex-col items-center justify-center gap-4">
      <Header title="Detalhes do pedido" />

      {order && (
        <div className="flex flex-col gap-2 text-sm w-full max-w-lg">
          <Status order={order} customer={customer} />

          <Card className="flex flex-col items-center gap-2 text-center py-6">
            {paymentType === 'CREDIT' && <CreditCard />}
            {paymentType === 'DEBIT' && <CreditCard />}
            {paymentType === 'CASH' && <Banknote />}
            {paymentType === 'PIX' && <DollarSign />}
            <p>
              Você pagará {formatCurrencyBRL(totalAmount)}{' '}
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
            <span className="text-muted-foreground">
              {order && formatDate(order?.created_at, 'dd/MM HH:mm:ss')}
            </span>
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
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrencyBRL(order?.total?.total_amount)}</span>
            </p>
          </Card>

          {order.type === 'DELIVERY' && (
            <Card className="p-4">
              <p>
                <span className="text-muted-foreground">
                  {currentStatus.delivery_address} na
                </span>{' '}
                <strong>{formatAddress(address)}</strong>
              </p>
            </Card>
          )}

          {order.type === 'TAKEOUT' && (
            <Card className="p-4">
              <p>
                <span className="text-muted-foreground">
                  Retire seu pedido na
                </span>{' '}
                <strong>{storeAddress && formatAddress(storeAddress)}</strong>
              </p>
            </Card>
          )}

          <Card className="flex flex-col gap-3 p-4">
            {order.order_items
              .filter((item) => item.product_id)
              .map((item) => (
                <ProductCard
                  key={item.id}
                  data={item.products}
                  variant="bag_items"
                  variations={order.order_item_variations}
                  observations={item.observations}
                  extras={item.extras}
                  quantity={item.quantity}
                  storeSubdomain={store?.store_subdomain}
                />
              ))}
          </Card>
        </div>
      )}
    </section>
  )
}
