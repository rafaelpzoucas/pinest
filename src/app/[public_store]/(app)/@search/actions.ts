import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'
import { readStoreByName } from '../@header/actions'

export async function readCategoriesByStoreName(storeName?: string): Promise<{
  data: CategoryType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByName(storeName)

  if (storeError) {
    console.error(storeError)
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store?.id)

  return { data, error }
}
