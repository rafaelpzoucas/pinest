import { formatCurrencyBRL } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'
import { OrderType } from '@/models/order'

export function Total({ order }: { order?: OrderType }) {
  if (!order) {
    return null
  }

  const isIfood = order.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && order.ifood_order_data

  const subtotal = order.total.subtotal
  const deliveryFee = order?.total?.shipping_price
  const totalAmount = order?.total?.total_amount

  return (
    <section
      className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
        break-inside-avoid"
    >
      <h3 className="mx-auto uppercase">Total</h3>

      <p className="flex flex-row items-center justify-between">
        <span>Subtotal:</span> <span>{formatCurrencyBRL(subtotal)}</span>
      </p>
      <p className="flex flex-row items-center justify-between">
        <span>Taxa de entrega:</span>{' '}
        <span>{formatCurrencyBRL(deliveryFee)}</span>
      </p>
      {isIfood && ifoodOrder.total.additionalFees ? (
        <p className="flex flex-row items-center justify-between">
          <span>Taxa adicional:</span>{' '}
          <span>{formatCurrencyBRL(ifoodOrder.total.additionalFees)}</span>
        </p>
      ) : null}

      {isIfood && ifoodOrder.benefits && ifoodOrder.benefits.length > 0 ? (
        <p className="flex flex-row items-center justify-between">
          <span>
            Desconto: ({ifoodOrder.benefits[0].sponsorshipValues[0].name})
          </span>{' '}
          <span>{formatCurrencyBRL(ifoodOrder.benefits[0].value * -1)}</span>
        </p>
      ) : null}

      {order?.total?.discount ? (
        <p className="flex flex-row items-center justify-between">
          <span>Desconto:</span>{' '}
          <span>{formatCurrencyBRL(order?.total?.discount * -1)}</span>
        </p>
      ) : null}

      <strong className="flex flex-row items-center justify-between uppercase">
        <span>Total do pedido:</span>{' '}
        <span>{formatCurrencyBRL(totalAmount)}</span>
      </strong>
    </section>
  )
}
