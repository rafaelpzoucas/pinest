import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { readTableByIdCached } from '../[id]/actions'
import { CreateSaleForm } from './form'
import { readStoreDataCached } from './products/actions'

export default async function CreateTablePage({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const [store] = await readStoreDataCached()
  const [tableData] = await readTableByIdCached({ id: searchParams.id })

  const categories = store?.categories as unknown as CategoryType[]
  const products = store?.products as unknown as ProductType[]
  const extras = store?.extras as unknown as ExtraType[]

  return (
    <main className="space-y-6 p-4 lg:px-0 h-screen">
      {store && (
        <CreateSaleForm
          categories={categories}
          products={products}
          extras={extras}
          table={tableData?.table}
        />
      )}
    </main>
  )
}
