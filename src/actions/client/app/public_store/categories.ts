import { createClient } from '@/lib/supabase/client'
import { CategoryType } from '@/models/category'

export async function readCategoriesData(storeId?: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        *,
        products (
          *,
          product_images (*)
        ) 
      `,
    )
    .eq('store_id', storeId)

  if (error || !data) {
    throw new Error('Não foi possível ler as categorias.', error)
  }

  return { categories: data as CategoryType[] }
}
