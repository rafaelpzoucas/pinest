'use server'

import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'
import { readStoreByName } from '../@header/actions'

export async function getProductsByCategory(storeName: string): Promise<{
  categories: CategoryType[] | null
  categoriesError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByName(storeName)

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
