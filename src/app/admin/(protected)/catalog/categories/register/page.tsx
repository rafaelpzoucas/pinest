import { Header } from '@/components/header'
import { CategoryForm } from './form'

export default function NewCategory({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  return (
    <div className="space-y-4">
      <Header title={`${searchParams.id ? 'Editar' : 'Nova'} categoria`} />

      <CategoryForm />
    </div>
  )
}
