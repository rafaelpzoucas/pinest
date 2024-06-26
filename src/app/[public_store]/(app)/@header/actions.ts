import { createClient } from '@/lib/supabase/server'
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
