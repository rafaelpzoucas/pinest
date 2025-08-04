import { readTableByIdCached } from '../[id]/actions'
import { CreateSaleForm } from './form'
import { readStoreDataCached } from './products/actions'

export default async function CreateTablePage({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const [storeData] = await readStoreDataCached()
  const [tableData] = await readTableByIdCached({ id: searchParams.id })

  return (
    <main className="space-y-6 p-4 lg:px-0 h-screen">
      {storeData && (
        <CreateSaleForm
          storeId={storeData?.store.id}
          table={tableData?.table}
        />
      )}
    </main>
  )
}
