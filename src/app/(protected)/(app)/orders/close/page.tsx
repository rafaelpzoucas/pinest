import { Card } from '@/components/ui/card'
import { OrderItemsType } from '@/models/order'
import { PaymentType } from '@/models/payment'
import { isPermissionGranted } from '../../actions'
import { readOrderByIdCached } from '../deliveries/[id]/actions'
import { readTableByIdCached } from '../tables/[id]/actions'
import { readPaymentsCached } from './actions'
import { readCustomersCached } from './customers/actions'
import { DataTableStored } from './data-table/data-table-stored'
import { CloseBillForm } from './form'

export default async function CloseBill({
  searchParams,
}: {
  searchParams: { table_id: string; order_id: string }
}) {
  const [customersData] = await readCustomersCached()
  const [tableData] = await readTableByIdCached({ id: searchParams.table_id })
  const [orderData] = await readOrderByIdCached({
    id: searchParams.order_id,
  })
  const [paymentsData] = await readPaymentsCached({
    table_id: searchParams.table_id,
    order_id: searchParams.order_id,
  })
  const [permission] = await isPermissionGranted({
    feature: 'integration_ifood',
  })

  const sale = tableData?.table ?? orderData?.order

  const orderDiscount = orderData?.order.total.discount

  const storeCustomers = customersData?.customers

  const orderItems: OrderItemsType[] = sale.order_items
  const orderPayments = paymentsData?.payments as unknown as PaymentType[]

  const organizedOrderItems = [
    ...orderItems.filter((item) => !item.is_paid),
    ...orderItems.filter((item) => item.is_paid),
  ]

  return (
    <main className="space-y-6 p-4 pb-16 lg:px-0">
      <div className="flex flex-col lg:grid grid-cols-[3fr_2fr] gap-4 items-start">
        <section>
          <Card className="p-4 w-[calc(100vw_-_32px)] lg:w-auto">
            <section className="flex flex-col gap-2">
              <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

              <DataTableStored data={organizedOrderItems} />
            </section>
          </Card>
        </section>
        <aside className="sticky top-4 w-full">
          <CloseBillForm
            saleDiscount={orderDiscount}
            payments={orderPayments}
            storeCustomers={storeCustomers}
            isPermissionGranted={permission?.granted}
          />
        </aside>
      </div>
    </main>
  )
}
