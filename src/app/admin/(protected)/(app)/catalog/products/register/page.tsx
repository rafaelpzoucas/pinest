import { AdminHeader } from '@/components/admin-header'
import { readUser } from '../../../config/(options)/account/actions'
import { readCategoriesByStore } from '../../categories/actions'
import { readProductById } from './actions'
import { ProductForm } from './form/form'

export default async function NewProduct({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { data: user } = await readUser()
  const { data: categories, error: categoriesError } =
    await readCategoriesByStore()
  const { product, productError } = await readProductById(searchParams.id)

  const displayId = product?.id.substring(0, 4)

  if (productError) {
    console.error(productError)
  }

  if (categoriesError) {
    console.error(categoriesError)
  }

  return (
    <div className="space-y-4 p-4 lg:px-0">
      <AdminHeader
        title={`${searchParams.id ? 'Editando produto #' + displayId : 'Novo produto'}`}
        withBackButton
      />

      <ProductForm categories={categories} product={product} />
    </div>
  )
}
