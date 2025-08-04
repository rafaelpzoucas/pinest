import { CategoryType } from '@/models/category'

export async function readAdminCategories(storeId: string) {
  const res = await fetch(`/api/v1/admin/categories?storeId=${storeId}`)

  if (!res.ok) {
    throw new Error(`Erro ao buscar categorias: ${res.status}`)
  }

  const { categories } = await res.json()

  return categories as CategoryType[]
}
