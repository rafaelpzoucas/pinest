'use server'

import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'
import { StoreType } from '@/models/store'

export async function readStoreByName(storeName: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('name', storeName)
    .single()

  return { store, storeError }
}

export async function getProductsByCategory(storeId?: string): Promise<{
  categories: CategoryType[] | null
  categoriesError: any | null
}> {
  const supabase = createClient()
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
    .eq('store_id', storeId)

  return { categories, categoriesError }
}
