import { AdminHeader } from '@/app/admin-header'
import { CategoryType } from '@/models/category'
import { CustomerType } from '@/models/customer'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { ShippingConfigType } from '@/models/shipping'
import { readCustomers } from './customers/actions'
import { CreatePurchaseForm } from './form'
import { readStoreData } from './products/actions'

export default async function CreatePurchasePage() {
  const [customersData] = await readCustomers()
  const [data] = await readStoreData()

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <AdminHeader title="Novo pedido" />

      {customersData && data && (
        <CreatePurchaseForm
          customers={customersData?.customers as unknown as CustomerType[]}
          products={data?.products as unknown as ProductType[]}
          categories={data?.categories as unknown as CategoryType[]}
          extras={data?.extras as unknown as ExtraType[]}
          shipping={data?.shippings as unknown as ShippingConfigType}
        />
      )}
    </main>
  )
}
