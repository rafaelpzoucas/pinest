import { formatCurrencyBRL } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'
import { PurchaseType } from '@/models/purchase'

export function Total({ purchase }: { purchase: PurchaseType }) {
  const purchaseItemsPrice =
    purchase?.purchase_items.reduce((acc, item) => {
      // Calculando o total do item (produto base)
      const itemTotal = item.product_price

      // Calculando o total dos extras
      const extrasTotal = item.extras.reduce((accExtra, extra) => {
        return accExtra + extra.price * extra.quantity
      }, 0)

      // Somando o total do item com o total dos extras
      return (acc + itemTotal + extrasTotal) * item.quantity
    }, 0) ?? 0

  if (!purchase) {
    return null
  }

  const isIfood = purchase.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && purchase.ifood_order_data
  return (
    <section
      className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
        break-inside-avoid"
    >
      <h3 className="mx-auto uppercase">Total</h3>

      <p className="flex flex-row items-center justify-between">
        <span>Total dos itens:</span>{' '}
        <span>
          {formatCurrencyBRL(
            !isIfood
              ? purchaseItemsPrice
              : ifoodOrder.payments.methods[0].value,
          )}
        </span>
      </p>
      <p className="flex flex-row items-center justify-between">
        <span>Taxa de entrega:</span>{' '}
        <span>{formatCurrencyBRL(purchase?.total?.shipping_price)}</span>
      </p>
      {isIfood && (
        <p className="flex flex-row items-center justify-between">
          <span>Taxa adicional:</span>{' '}
          <span>{formatCurrencyBRL(ifoodOrder.total.additionalFees)}</span>
        </p>
      )}

      {isIfood && ifoodOrder.benefits && ifoodOrder.benefits.length > 0 && (
        <p className="flex flex-row items-center justify-between">
          <span>
            Desconto: ({ifoodOrder.benefits[0].sponsorshipValues[0].name})
          </span>{' '}
          <span>{formatCurrencyBRL(ifoodOrder.benefits[0].value * -1)}</span>
        </p>
      )}

      {purchase?.total?.total_amount && (
        <p className="flex flex-row items-center justify-between">
          <span>Desconto:</span>{' '}
          <span>{formatCurrencyBRL(purchase?.total?.discount)}</span>
        </p>
      )}

      <strong className="flex flex-row items-center justify-between uppercase">
        <span>Total do pedido:</span>{' '}
        <span>{formatCurrencyBRL(purchase?.total?.total_amount)}</span>
      </strong>
    </section>
  )
}
