import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { ProductCard } from '../../(app)/components/product-card'
import { readPurchaseById } from './actions'
import { Status } from './status'

export default async function PurchasePage({
  params,
}: {
  params: { id: string; public_store: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) console.error(purchaseError)

  return (
    <section className="p-4">
      <Header title="Detalhes do pedido" />

      <div className="flex flex-col gap-2">
        <Status purchase={purchase} />

        <Card className="p-4">
          <p>
            {purchase && formatDate(purchase?.created_at, 'dd/MM HH:mm:ss')}
          </p>
          <p className="flex flex-row items-center justify-between">
            <span>Produtos(3)</span>
            <span>R$ 100,00</span>
          </p>
          <p className="flex flex-row items-center justify-between">
            <span>Desconto</span>
            <span>R$ 0,00</span>
          </p>
          <p className="flex flex-row items-center justify-between">
            <span>Frete</span>
            <span>Grátis</span>
          </p>
          <p className="flex flex-row items-center justify-between">
            <span>Total</span>
            <span>R$ 100,00</span>
          </p>
        </Card>

        <Card className="p-4">
          <p>R$ 100,00</p>
          <span>PIX</span>
        </Card>

        <Card className="p-4">
          <p>Rua Santa Cruz, 801</p>
          <span>Assis/SP</span>
        </Card>

        <Card className="p-4">
          <ul>
            <li>
              <div>
                <ProductCard data={purchase?.purchase_items[0].products} />
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
