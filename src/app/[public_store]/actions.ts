'use server'

import { createClient } from '@/lib/supabase/server'
import { StoreType } from '@/models/store'

export async function getStoreByStoreURL(storeURL: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_url', storeURL)
    .single()

  return { store, storeError }
}
