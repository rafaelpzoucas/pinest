import { CategoryForm } from '@/app/admin/(protected)/(app)/catalog/categories/register/form'

export default async function RegisterProduct() {
  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Nova categoria</h1>

      <CategoryForm category={null} />
    </div>
  )
}
