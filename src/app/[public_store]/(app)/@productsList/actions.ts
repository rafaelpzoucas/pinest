'use server'

import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'
import { getStoreByStoreURL } from '../../actions'

export async function getProductsByCategory(storeURL: string): Promise<{
  categories: CategoryType[] | null
  categoriesError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(storeURL)

  if (storeError) {
    console.error(storeError)
  }

  const { data: categories, error: categoriesError } = await supabase
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
    .eq('store_id', store?.id)

  return { categories, categoriesError }
}
