import { formatAddress } from '@/lib/utils'
import { IfoodOrder } from '@/models/ifood'
import { PurchaseType } from '@/models/purchase'
import { format } from 'date-fns'
import { DELIVERY_TYPES } from './page'

export function Info({ purchase }: { purchase: PurchaseType }) {
  const isIfood = purchase.is_ifood
  const ifoodOrder: IfoodOrder = isIfood && purchase.ifood_order_data

  const customerName =
    purchase?.customers?.users?.name ??
    purchase.guest_data?.name ??
    purchase.customers.name
  const customerPhone =
    purchase?.customers?.users?.phone ??
    purchase.guest_data?.phone ??
    purchase.customers.phone
  const customerAddress = ((purchase.addresses
    ? formatAddress(purchase.addresses)
    : purchase.guest_data?.address) ?? purchase.customers.address) as string

  const displayId = isIfood
    ? ifoodOrder.displayId
    : purchase?.id.substring(0, 4)

  return (
    <section className="w-full">
      <header className="flex flex-col items-center justify-center">
        <h1 className="uppercase">Pedido #{displayId}</h1>

        <h2 className="font-bold uppercase">
          {DELIVERY_TYPES[purchase.type as keyof typeof DELIVERY_TYPES]}
        </h2>
      </header>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 break-inside-avoid
          print-section"
      >
        {isIfood && <p className="text-center">{ifoodOrder.merchant.name}</p>}

        <p>Data do pedido: {format(purchase.created_at, 'dd/MM HH:mm:ss')}</p>
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
          purchase.observations) && (
          <p>
            Observações:{' '}
            {ifoodOrder.delivery.observations ?? purchase.observations}
          </p>
        )}
      </div>
    </section>
  )
}
