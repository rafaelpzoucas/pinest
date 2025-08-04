import { ProductType } from '@/models/product'

export async function readAdminProducts(storeId: string) {
  const res = await fetch(`/api/v1/admin/products?storeId=${storeId}`)

  if (!res.ok) {
    throw new Error(`Erro ao buscar produtos: ${res.status}`)
  }

  const { products } = await res.json()

  return products as ProductType[]
}
