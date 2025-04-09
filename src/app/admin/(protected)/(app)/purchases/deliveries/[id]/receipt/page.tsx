import { IfoodItem } from '@/models/ifood'
import { format } from 'date-fns'
import { Asterisk, Plus } from 'lucide-react'
import { readPurchaseById } from '../actions'
import { DELIVERY_TYPES } from './info'
import { Printer } from './printer'

export default async function PrintKitchenReceipt({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { reprint: string }
}) {
  const [purchaseData] = await readPurchaseById({ id: params.id })

  const purchase = purchaseData?.purchase

  const displayId = purchase?.id.substring(0, 4)

  if (!purchase) {
    return null
  }

  const reprint = searchParams.reprint
  const unprintedItems = purchase.purchase_items.filter((item) => !item.printed)

  const itemsList = reprint ? purchase.purchase_items : unprintedItems

  const customerName = purchase.store_customers.customers.name

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
            ? itemsList.map((item) => {
                if (!item.products) {
                  return null
                }

                return (
                  <li
                    key={item.id}
                    className="border-b border-dotted last:border-0 py-2 print-section uppercase flex flex-col"
                  >
                    <span>
                      {item.quantity} {item.products.name}
                    </span>

                    {item.extras.length > 0 &&
                      item.extras.map((extra) => (
                        <p
                          key={extra.id}
                          className="flex flex-row items-center w-full"
                        >
                          <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                          {extra.name}
                        </p>
                      ))}

                    <div className="flex flex-col">
                      {item.observations &&
                        item.observations.length > 0 &&
                        item.observations.map((obs) => (
                          <span className="flex flex-row">
                            <Asterisk className="w-3 h-3 mr-1" />
                            {obs}
                          </span>
                        ))}
                    </div>
                  </li>
                )
              })
            : ifoodItems.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-dotted last:border-0 py-2 print-section uppercase flex flex-col"
                >
                  <span>
                    {item.quantity} {item.name}
                  </span>

                  {item.options.length > 0 &&
                    item.options.map((option) => (
                      <p
                        key={option.id}
                        className="flex flex-row items-center w-full text-xs"
                      >
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
