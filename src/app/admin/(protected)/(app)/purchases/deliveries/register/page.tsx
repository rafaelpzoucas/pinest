import { readPurchaseByIdCached } from '../[id]/actions'
import { readStoreDataCached } from './actions'
import { CreatePurchaseForm } from './form'

export default async function CreatePurchasePage({
  searchParams,
}: {
  searchParams: { purchase_id: string }
}) {
  const [[purchaseData], [data]] = await Promise.all([
    readPurchaseByIdCached({ id: searchParams.purchase_id }),
    readStoreDataCached(),
  ])

  const purchase = purchaseData?.purchase
  const storeId = data?.store.id

  return (
    <main className="space-y-6 p-4 lg:px-0 w-full">
      {data && <CreatePurchaseForm storeId={storeId} purchase={purchase} />}
    </main>
  )
}
