import { Header } from '@/components/header'
import { readUser } from '../../../account/actions'
import { readCategoriesByStore } from '../../categories/actions'
import { ProductForm } from './form'

export default async function NewProduct({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { data: user } = await readUser()
  const { data: categories, error } = await readCategoriesByStore(
    user?.stores[0].id,
  )

  return (
    <div className="space-y-4">
      <Header title={`${searchParams.id ? 'Editar' : 'Novo'} produto`} />

      <ProductForm categories={categories} />
    </div>
  )
}
