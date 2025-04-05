import { AdminHeader } from '@/app/admin-header'
import { readCustomers } from '../../close/customers/actions'
import { CreatePurchaseForm } from './form'
import { readStoreData } from './products/actions'

export default async function CreatePurchasePage() {
  const [customersData] = await readCustomers()
  const [data] = await readStoreData()

  const customers = customersData?.customers
  const products = data?.products
  const categories = data?.categories
  const extras = data?.extras
  const shippings = data?.shippings

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <AdminHeader title="Novo pedido" withBackButton />

      {customersData && data && (
        <CreatePurchaseForm
          customers={customers}
          products={products}
          categories={categories}
          extras={extras}
          shipping={shippings}
        />
      )}
    </main>
  )
}
