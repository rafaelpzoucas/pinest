import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { readTableById } from '../[id]/actions'
import { CreateSaleForm } from './form'
import { readStoreData } from './products/actions'

export default async function CreateTablePage({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const [store] = await readStoreData()
  const [tableData] = await readTableById({ id: searchParams.id })

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
