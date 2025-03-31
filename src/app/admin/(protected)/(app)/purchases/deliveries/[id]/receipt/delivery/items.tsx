import { formatCurrencyBRL } from '@/lib/utils'
import { IfoodItem, IfoodOrder } from '@/models/ifood'
import { PurchaseType } from '@/models/purchase'
import { Plus } from 'lucide-react'

export function Items({ purchase }: { purchase: PurchaseType }) {
  const isIfood = purchase.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && purchase.ifood_order_data
  const ifoodItems: IfoodItem[] = ifoodOrder?.items ?? []

  return (
    <section className="w-full border-b border-dashed last:border-0 py-4 space-y-1">
      <h3 className="mx-auto uppercase">Itens do pedido</h3>

      <ul>
        {!isIfood
          ? purchase.purchase_items.map((item) => {
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
                <li
                  key={item.id}
                  className="border-b border-dotted last:border-0 py-2 print-section"
                >
                  <div className="flex flex-row items-start justify-between">
                    <span>
                      {item.quantity} un. {item.products.name}
                    </span>
                    <span>{formatCurrencyBRL(item.product_price)}</span>
                  </div>
                  {item.extras.length > 0 &&
                    item.extras.map((extra) => (
                      <p className="flex flex-row items-center justify-between w-full">
                        <span className="flex flex-row items-center">
                          <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                          {extra.name}
                        </span>
                        <span>
                          {formatCurrencyBRL(extra.price * extra.quantity)}
                        </span>
                      </p>
                    ))}

                  {item.observations && (
                    <strong className="uppercase">
                      obs: {item.observations}
                    </strong>
                  )}

                  <footer className="flex flex-row items-center justify-between">
                    <p>Total:</p>
                    <span>{formatCurrencyBRL(total)}</span>{' '}
                    {/* Exibindo o total calculado */}
                  </footer>
                </li>
              )
            })
          : ifoodItems.map((item) => {
              // Calculando o total do item (produto base)
              const itemTotal = item.price

              // Calculando o total dos extras
              const extrasTotal = item.options.reduce((acc, extra) => {
                return acc + extra.price * extra.quantity
              }, 0)

              // Somando o total do item com o total dos extras
              const total = (itemTotal + extrasTotal) * item.quantity

              return (
                <li
                  key={item.id}
                  className="border-b border-dotted last:border-0 py-2 print-section"
                >
                  <div className="flex flex-row items-start justify-between">
                    <span>
                      {item.quantity} un. {item.name}
                    </span>
                    <span>{formatCurrencyBRL(item.price)}</span>
                  </div>
                  {item.options.length > 0 &&
                    item.options.map((option) => (
                      <p className="flex flex-row items-center justify-between w-full">
                        <span className="flex flex-row items-center">
                          <Plus className="w-3 h-3 mr-1" /> {option.quantity}{' '}
                          ad. {option.name}
                        </span>
                        <span>
                          {formatCurrencyBRL(option.price * option.quantity)}
                        </span>
                      </p>
                    ))}

                  {item.observations && (
                    <strong className="uppercase">
                      obs: {item.observations}
                    </strong>
                  )}

                  <footer className="flex flex-row items-center justify-between">
                    <p>Total:</p>
                    <span>{formatCurrencyBRL(total)}</span>{' '}
                    {/* Exibindo o total calculado */}
                  </footer>
                </li>
              )
            })}
      </ul>
    </section>
  )
}
