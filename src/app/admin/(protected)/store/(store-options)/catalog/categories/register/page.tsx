import { CategoryForm } from './form'

export default function NewProduct({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {searchParams.id ? 'Editar' : 'Nova'} categoria
      </h1>

      <CategoryForm />
    </div>
  )
}
