'use server'

import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'

export async function getProductsByCategory(): Promise<{
  categories: CategoryType[] | null
  categoriesError: any | null
}> {
  const supabase = createClient()
  const { data: categories, error: categoriesError } = await supabase.from(
    'categories',
  ).select(`
    *,
    products (
      *,
      product_images (*)
    )
  `)

  return { categories, categoriesError }
}
