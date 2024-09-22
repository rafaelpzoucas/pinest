import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'
import { getStoreByStoreURL } from '../../actions'

export async function readCategoriesByStoreURL(storeURL: string): Promise<{
  data: CategoryType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(storeURL)

  if (storeError) {
    console.error(storeError)
  }

  const { data, error } = await supabase
    .from('categories')
    .select(
      `
      *,
      products (*)  
    `,
    )
    .eq('store_id', store?.id)

  return { data, error }
}
