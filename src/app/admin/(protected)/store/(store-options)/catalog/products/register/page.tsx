import { readCategories } from '../../categories/actions'
import { ProductForm } from './form'

export default async function NewProduct() {
  const { data: categories, error } = await readCategories()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Novo produto</h1>

      <ProductForm categories={categories} />
    </div>
  )
}
