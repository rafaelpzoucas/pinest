import { readCustomers } from '../../close/customers/actions'
import { readPurchaseById } from '../[id]/actions'
import { CreatePurchaseForm } from './form'
import { readStoreData } from './products/actions'

export default async function CreatePurchasePage({
  searchParams,
}: {
  searchParams: { purchase_id: string }
}) {
  const [[purchaseData], [customersData], [data]] = await Promise.all([
    readPurchaseById({ id: searchParams.purchase_id }),
    readCustomers(),
    readStoreData(),
  ])

  const customers = customersData?.customers
  const products = data?.products
  const categories = data?.categories
  const extras = data?.extras
  const shippings = data?.shippings
  const purchase = purchaseData?.purchase

  return (
    <main className="space-y-6 p-4 lg:px-0 w-full">
      {customersData && data && (
        <CreatePurchaseForm
          customers={customers}
          products={products}
          categories={categories}
          extras={extras}
          shipping={shippings}
          purchase={purchase}
        />
      )}
    </main>
  )
}
