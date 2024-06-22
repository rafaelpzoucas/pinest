import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Card } from '@/components/ui/card'
import { formatCurrencyBRL, formatDate } from '@/lib/utils'
import { readPurchaseById } from './actions'
import { Status, StatusKey } from './status'
import { statuses } from './statuses'

export default async function PurchasePage({
  params,
}: {
  params: { id: string; public_store: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) console.error(purchaseError)

  const address = purchase?.addresses

  const currentStatus = statuses[purchase?.status as StatusKey]

  return (
    <section className="p-4">
      <Header title="Detalhes do pedido" />

      {purchase && (
        <div className="flex flex-col gap-2 text-sm">
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
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span>R$ 0,00</span>
            </p>
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>Grátis</span>
            </p>
            <p className="flex flex-row items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrencyBRL(purchase.total_amount)}</span>
            </p>
          </Card>

          <Card className="p-4">
            <p>
              {currentStatus.delivery_address} na {address?.street},{' '}
              {address?.number}
              {address?.complement && `, ${address?.complement}`} -{' '}
              {address?.neighborhood}
            </p>
            <span className="text-muted-foreground">
              {address?.city}/{address?.state}
            </span>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            {purchase.purchase_items.map((item) => (
              <ProductCard
                key={item.id}
                data={item.products}
                publicStore={params.public_store}
              />
            ))}
          </Card>
        </div>
      )}
    </section>
  )
}
