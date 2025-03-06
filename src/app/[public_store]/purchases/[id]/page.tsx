import { ProductCard } from '@/components/product-card'
import { Header } from '@/components/store-header'
import { Card } from '@/components/ui/card'
import { formatAddress, formatCurrencyBRL, formatDate } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { readStoreAddress } from '../../checkout/actions'
import { readPurchaseById } from './actions'
import { Status, StatusKey } from './status'

export default async function PurchasePage({
  params,
}: {
  params: { id: string; public_store: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)
  const { storeAddress } = await readStoreAddress(params.public_store)

  if (purchaseError) console.error(purchaseError)

  const address = purchase?.addresses

  const currentStatus = statuses[purchase?.status as StatusKey]
  const shippingPrice = purchase?.shipping_price ?? 0

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <Header title="Detalhes do pedido" />

      {purchase && (
        <div className="flex flex-col gap-2 text-sm w-full max-w-lg">
          <Status purchase={purchase} storeName={params.public_store} />

          <Card className="p-4">
            <span className="text-muted-foreground">
              {purchase && formatDate(purchase?.created_at, 'dd/MM HH:mm:ss')}
            </span>
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">
                Produtos({purchase.purchase_items.length})
              </span>
              <span>{formatCurrencyBRL(purchase.total_amount)}</span>
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
              <span>
                {formatCurrencyBRL(purchase.total_amount + shippingPrice)}
              </span>
            </p>
          </Card>

          {shippingPrice && address ? (
            <Card className="p-4">
              <p>
                <span className="text-muted-foreground">
                  {currentStatus.delivery_address} na
                </span>{' '}
                <strong>{formatAddress(address)}</strong>
              </p>
            </Card>
          ) : (
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
            {purchase.purchase_items.map((item) => (
              <ProductCard
                key={item.id}
                data={item.products}
                variant="bag_items"
                variations={purchase.purchase_item_variations}
                publicStore={params.public_store}
                observations={item.observations}
                extras={item.extras}
                quantity={item.quantity}
              />
            ))}
          </Card>
        </div>
      )}
    </section>
  )
}
