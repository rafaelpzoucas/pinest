import { TableType } from '@/models/table'
import { Asterisk, Plus } from 'lucide-react'
import { readTableByIdCached } from '../actions'
import { Printer } from './printer'

export default async function PrintKitchenReceipt({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { reprint: string }
}) {
  const [tableData] = await readTableByIdCached({ id: params.id })

  if (!tableData) {
    console.error('Erro ao buscar as informações da mesa.')
    return
  }

  const reprint = searchParams.reprint

  const table: TableType = tableData.table
  const unprintedItems = table.order_items.filter((item) => !item.printed)

  const itemsList = reprint ? table.order_items : unprintedItems

  const displayId = table.number

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4"
    >
      <h1 className="uppercase text-sm">cozinha</h1>

      <h2 className="uppercase text-base">
        Mesa #{displayId}
        {table.description ? ' - ' + table.description : ''}
      </h2>

      <div
        className="w-full border-b border-dashed last:border-0 py-4 space-y-1 print-section
          break-inside-avoid text-base"
      >
        <ul>
          {itemsList.map((item) => {
            if (!item.products) return null
            return (
              <li
                key={item.id}
                className="border-b border-dashed last:border-0 py-2 print-section uppercase"
              >
                <span>
                  {item.quantity} {item.products.name}
                </span>

                <div className="ml-3">
                  {item.extras.length > 0 &&
                    item.extras.map((extra) => (
                      <p
                        key={extra.id}
                        className="flex flex-row items-center w-full border-b border-dotted last:border-0"
                      >
                        <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{' '}
                        {extra.name}
                      </p>
                    ))}

                  <div className="flex flex-col">
                    {item.observations &&
                      item.observations.length > 0 &&
                      item.observations.map((obs) => (
                        <span className="flex flex-row items-center border-b border-dotted last:border-0">
                          <Asterisk className="w-3 h-3 mr-1" />
                          {obs}
                        </span>
                      ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <Printer tableId={table.id} />
    </div>
  )
}
