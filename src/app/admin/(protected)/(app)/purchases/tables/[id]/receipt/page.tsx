import { TableType } from '@/models/table'
import { Plus } from 'lucide-react'
import { readTableById } from '../actions'
import { Printer } from './printer'

export default async function PrintKitchenReceipt({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { reprint: string }
}) {
  const [tableData] = await readTableById({ id: params.id })

  if (!tableData) {
    console.error('Erro ao buscar as informações da mesa.')
    return
  }

  const reprint = searchParams.reprint

  const table: TableType = tableData.table
  const unprintedItems = table.purchase_items.filter((item) => !item.printed)

  const itemsList = reprint ? table.purchase_items : unprintedItems

  const displayId = table.number

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
    >
      <h1 className="uppercase text-base">cozinha</h1>

      <h2 className="uppercase">Mesa #{displayId}</h2>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid text-base"
      >
        <h3 className="mx-auto text-xs uppercase">Itens do pedido</h3>

        <ul>
          {itemsList.map((item) => {
            if (!item.products) return null
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
                    <p className="flex flex-row items-center w-full text-xs">
                      <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                      {extra.name}
                    </p>
                  ))}

                {item.observations && <strong>**{item.observations}</strong>}
              </li>
            )
          })}
        </ul>
      </div>

      <Printer tableId={table.id} />
    </div>
  )
}
