import { AdminHeader } from '@/app/admin-header'
import { Card } from '@/components/ui/card'
import { CustomerType } from '@/models/customer'
import { PaymentType } from '@/models/payment'
import { PurchaseItemsType } from '@/models/purchase'
import { readPurchaseById } from '../deliveries/[id]/actions'
import { readTableById } from '../tables/[id]/actions'
import { readPayments } from './actions'
import { readCustomers } from './customers/actions'
import { DataTableStored } from './data-table/data-table-stored'
import { CloseBillForm } from './form'

export default async function CloseBill({
  searchParams,
}: {
  searchParams: { table_id: string; purchase_id: string }
}) {
  const [customersData] = await readCustomers()
  const [tableData] = await readTableById({ id: searchParams.table_id })
  const [purchaseData] = await readPurchaseById({
    id: searchParams.purchase_id,
  })
  const [paymentsData] = await readPayments({
    table_id: searchParams.table_id,
    purchase_id: searchParams.purchase_id,
  })

  const sale = tableData?.table ?? purchaseData?.purchase

  const purchaseItems: PurchaseItemsType[] = sale.purchase_items
  const purchasePayments = paymentsData?.payments as unknown as PaymentType[]

  const organizedPurchaseItems = [
    ...purchaseItems.filter((item) => !item.is_paid),
    ...purchaseItems.filter((item) => item.is_paid),
  ]

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <AdminHeader title="Fechar venda" />

      <div className="grid grid-cols-[3fr_2fr] gap-4 items-start">
        <section>
          <Card className="p-4">
            <section className="flex flex-col gap-2">
              <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

              <DataTableStored data={organizedPurchaseItems} />
            </section>
          </Card>
        </section>
        <aside className="sticky top-4">
          <CloseBillForm
            payments={purchasePayments}
            customers={customersData?.customers as unknown as CustomerType[]}
          />
        </aside>
      </div>
    </main>
  )
}
