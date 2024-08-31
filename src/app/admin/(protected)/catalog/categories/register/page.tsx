import { AdminHeader } from '@/components/admin-header'
import { readCategoryById } from '../actions'
import { CategoryForm } from './form'

export default async function NewCategory({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { category } = await readCategoryById(searchParams.id)

  const displayId = category?.id.substring(0, 4)

  return (
    <div className="flex flex-col items-center space-y-4 p-4 lg:px-0">
      <AdminHeader
        title={`${searchParams.id ? 'Editando categoria #' + displayId : 'Nova categoria'}`}
        withBackButton
      />

      <CategoryForm category={category} />
    </div>
  )
}
