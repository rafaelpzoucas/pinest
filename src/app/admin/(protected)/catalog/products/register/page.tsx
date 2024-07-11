import { Header } from '@/components/header'
import { readUser } from '../../../store/(store-options)/account/actions'
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
    await readCategoriesByStore(user?.stores[0].id)
  const { product, productError } = await readProductById(searchParams.id)

  if (productError) {
    console.error(productError)
  }

  if (categoriesError) {
    console.error(categoriesError)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="p-4 pb-0">
        <Header title={`${searchParams.id ? 'Editar' : 'Novo'} produto`} />
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  )
}
