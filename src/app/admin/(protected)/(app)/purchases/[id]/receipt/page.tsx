import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { readPurchaseById } from '../actions'
import { Printer } from './printer'

export default async function PrintKitchenReceipt({
  params,
}: {
  params: { id: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) {
    throw new Error(purchaseError)
  }

  const displayId = purchase?.id.substring(0, 4)

  const DELIVERY_TYPES = {
    pickup: 'Retirar na loja',
    delivery: 'Entregar',
  }

  if (!purchase) {
    return null
  }

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
    >
      <h1 className="uppercase text-base">cozinha</h1>

      <h2 className="uppercase">Pedido #{displayId}</h2>

      <h2 className="font-bold uppercase">
        {DELIVERY_TYPES[purchase.type as keyof typeof DELIVERY_TYPES]}
      </h2>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 break-inside-avoid
          print-section"
      >
        <p>Data: {format(purchase.created_at, 'dd/MM HH:mm:ss')}</p>
        <p>
          Cliente:{' '}
          {purchase?.customers?.users?.name ?? purchase.guest_data.name}
        </p>
        <p>
          Telefone:{' '}
          {purchase?.customers?.users?.phone ?? purchase.guest_data.phone}
        </p>
      </div>

      {/* Forçando uma nova página antes dos itens */}
      <div className="force-page-break"></div>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid text-base"
      >
        <h3 className="mx-auto text-xs uppercase">Itens do pedido</h3>

        <ul>
          {purchase.purchase_items.map((item) => (
            <li
              key={item.id}
              className="border-b border-dotted last:border-0 py-2 print-section uppercase"
            >
              <span>
                {item.quantity} {item.products.name}
              </span>

              {item.extras.length > 0 &&
                item.extras.map((extra) => (
                  <p className="flex flex-row items-center w-full text-xs">
                    <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                    {extra.name}
                  </p>
                ))}

              {item.observations && <strong>**{item.observations}</strong>}
            </li>
          ))}
        </ul>
      </div>

      <Printer purchaseId={purchase.id} />
    </div>
  )
}
