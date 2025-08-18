import { AdminHeader } from '@/app/admin-header'
import { Card } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { OrderItemsType } from '@/models/order'
import { statuses } from '@/models/statuses'
import { Plus } from 'lucide-react'
import { readTableByIdCached } from './actions'

type StatusKey = keyof typeof statuses

export default async function OrderPage({
  params,
}: {
  params: { id: string; print: string }
}) {
  const [data] = await readTableByIdCached({ id: params.id })

  const table = data?.table

  if (!table) {
    return null
  }

  const displayId = table.number
  const orderItems: OrderItemsType[] = table?.order_items

  return (
    <section className="flex flex-col gap-4 p-4 lg:px-0">
      <AdminHeader title={`Mesa: #${displayId}`} withBackButton />

      <div className="flex flex-col lg:grid grid-cols-2 gap-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

          <div className="flex flex-col gap-2">
            {orderItems &&
              orderItems.length > 0 &&
              orderItems.map((item) => {
                // Calculando o total do item (produto base)
                const itemTotal = item.product_price

                // Calculando o total dos extras
                const extrasTotal = item.extras.reduce((acc, extra) => {
                  return acc + extra.price * extra.quantity
                }, 0)

                // Somando o total do item com o total dos extras
                const total = (itemTotal + extrasTotal) * item.quantity

                return (
                  <Card key={item.id} className="p-4 space-y-2">
                    <header className="flex flex-row items-start justify-between gap-4 text-sm">
                      <strong className="line-clamp-2 uppercase">
                        {item.quantity} {item?.products?.name}
                      </strong>
                      <span>
                        {formatCurrencyBRL(item?.products?.price ?? 0)}
                      </span>
                    </header>

                    {item.extras.length > 0 &&
                      item.extras.map((extra) => (
                        <p
                          key={extra.id}
                          className="flex flex-row items-center justify-between w-full text-muted-foreground"
                        >
                          <span className="flex flex-row items-center">
                            <Plus className="w-3 h-3 mr-1" /> {extra.quantity}{' '}
                            ad. {extra.name}
                          </span>
                          <span>
                            {formatCurrencyBRL(extra.price * extra.quantity)}
                          </span>
                        </p>
                      ))}

                    {item.observations && (
                      <strong className="uppercase text-muted-foreground">
                        obs: {item.observations}
                      </strong>
                    )}

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
      </div>
    </section>
  )
}
