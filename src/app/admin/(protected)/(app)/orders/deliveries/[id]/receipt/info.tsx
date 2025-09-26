import { formatAddress } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'
import { OrderType } from '@/models/order'
import { format } from 'date-fns'

export const DELIVERY_TYPES = {
  TAKEOUT: 'Retirar na loja',
  DELIVERY: 'Entregar',
}

export function Info({ order }: { order?: OrderType }) {
  const isIfood = order?.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && order.ifood_order_data

  const customer = isIfood
    ? order?.ifood_order_data.customer
    : order?.store_customers.customers

  const customerName = customer.name
  const customerPhone = isIfood
    ? `${customer.phone.number} ID: ${customer.phone.localizer}`
    : customer.phone
  const customerAddress = isIfood
    ? (order.delivery.address as unknown as string)
    : formatAddress(order?.store_customers.customers.address)

  const displayId = isIfood
    ? ifoodOrder.displayId
    : (order?.display_id ?? order?.id.substring(0, 4))

  if (!order) {
    return null
  }

  return (
    <section className="w-full border-b border-dashed">
      <header className="flex flex-col items-center justify-center">
        <h1 className="uppercase">Pedido #{displayId}</h1>

        <h2 className="font-bold uppercase">
          {DELIVERY_TYPES[order?.type as keyof typeof DELIVERY_TYPES]}
        </h2>
      </header>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 break-inside-avoid
          print-section"
      >
        {isIfood && <p className="text-center">{ifoodOrder.merchant.name}</p>}

        <p>Data do pedido: {format(order?.created_at, 'dd/MM HH:mm:ss')}</p>
        {isIfood && (
          <p>
            Data da entrega:{' '}
            {format(ifoodOrder.delivery.deliveryDateTime, 'dd/MM HH:mm:ss')}
          </p>
        )}
        <p className="flex flex-row items-start gap-2">
          Cliente: <span className="uppercase">{customerName}</span>
        </p>
        <p>Telefone: {customerPhone}</p>
        <p>Endereço: {customerAddress}</p>

        {((isIfood && ifoodOrder.delivery.observations) ||
          order?.observations) && (
          <p className="uppercase text-xs">
            Observações:{' '}
            {ifoodOrder?.delivery?.observations ?? order.observations}
          </p>
        )}
      </div>
    </section>
  )
}
