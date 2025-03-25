import { IfoodItem } from '@/models/ifood'
import { PurchaseType } from '@/models/purchase'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { readPurchaseById } from '../actions'
import { DELIVERY_TYPES } from './info'
import { Printer } from './printer'

export default async function PrintKitchenReceipt({
  params,
}: {
  params: { id: string }
}) {
  const [purchaseData] = await readPurchaseById({ id: params.id })

  const purchase: PurchaseType = purchaseData?.purchase

  const displayId = purchase?.id.substring(0, 4)

  if (!purchase) {
    return null
  }

  const customerName =
    purchase?.customers?.users?.name ??
    purchase.guest_data?.name ??
    purchase.customers.name

  const isIfood = purchase.is_ifood
  const ifoodItems: IfoodItem[] = isIfood && purchase.ifood_order_data.items

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
        <p>Cliente: {customerName}</p>
        {purchase.observations && (
          <p className="text-base"> OBS: {purchase.observations}</p>
        )}
      </div>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid text-base"
      >
        <h3 className="mx-auto text-xs uppercase">Itens do pedido</h3>

        <ul>
          {!isIfood
            ? purchase.purchase_items.map((item) => {
                if (!item.products) {
                  return null
                }

                return (
                  <li
                    key={item.id}
                    className="border-b border-dotted last:border-0 py-2 print-section uppercase"
                  >
                    <span>
                      {item.quantity} {item.products.name}
                    </span>

                    {item.extras.length > 0 &&
                      item.extras.map((extra) => (
                        <p className="flex flex-row items-center w-full">
                          <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                          {extra.name}
                        </p>
                      ))}

                    {item.observations && (
                      <strong>**{item.observations}</strong>
                    )}
                  </li>
                )
              })
            : ifoodItems.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-dotted last:border-0 py-2 print-section uppercase"
                >
                  <span>
                    {item.quantity} {item.name}
                  </span>

                  {item.options.length > 0 &&
                    item.options.map((option) => (
                      <p className="flex flex-row items-center w-full text-xs">
                        <Plus className="w-3 h-3 mr-1" /> {option.quantity} ad.{' '}
                        {option.name}
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
