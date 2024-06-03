import { Header } from '@/components/header'
import { readCategories } from '../../categories/actions'
import { ProductForm } from './form'

export default async function NewProduct({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { data: categories, error } = await readCategories()

  return (
    <div className="space-y-4">
      <Header title={`${searchParams.id ? 'Editar' : 'Novo'} produto`} />

      <ProductForm categories={categories} />
    </div>
  )
}
