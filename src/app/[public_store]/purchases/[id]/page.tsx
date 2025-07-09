import { ProductCard } from '@/components/product-card'
import { Header } from '@/components/store-header'
import { Card } from '@/components/ui/card'
import { formatAddress, formatCurrencyBRL, formatDate } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { readStoreCached } from '../../actions'
import { readPurchaseById } from './actions'
import { Status, StatusKey } from './status'

export default async function PurchasePage({
  params,
}: {
  params: { id: string }
}) {
  const [[storeData], [purchaseData]] = await Promise.all([
    readStoreCached(),
    readPurchaseById({ purchaseId: params.id }),
  ])

  const store = storeData?.store
  const storeAddress = store?.addresses[0]
  const purchase = purchaseData?.purchase
  const address = purchase?.delivery.address

  const total = purchase?.total
  const currentStatus = statuses[purchase?.status as StatusKey]
  const shippingPrice = total?.shipping_price ?? 0
  const subtotal = total?.subtotal ?? 0

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <Header title="Detalhes do pedido" />

      {purchase && (
        <div className="flex flex-col gap-2 text-sm w-full max-w-lg">
          <Status purchase={purchase} />

          <Card className="p-4">
            <span className="text-muted-foreground">
              {purchase && formatDate(purchase?.created_at, 'dd/MM HH:mm:ss')}
            </span>
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">
                Produtos({purchase.purchase_items.length})
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
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrencyBRL(purchase?.total?.total_amount)}</span>
            </p>
          </Card>

          {purchase.type === 'DELIVERY' && (
            <Card className="p-4">
              <p>
                <span className="text-muted-foreground">
                  {currentStatus.delivery_address} na
                </span>{' '}
                <strong>{formatAddress(address)}</strong>
              </p>
            </Card>
          )}

          {purchase.type === 'TAKEOUT' && (
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
            {purchase.purchase_items
              .filter((item) => item.product_id)
              .map((item) => (
                <ProductCard
                  key={item.id}
                  data={item.products}
                  variant="bag_items"
                  variations={purchase.purchase_item_variations}
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
