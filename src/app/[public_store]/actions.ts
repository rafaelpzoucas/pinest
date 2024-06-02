'use server'

import { createClient } from '@/lib/supabase/server'
import { StoreType } from '@/models/store'

export async function getStores(name: string): Promise<{
  stores: StoreType[] | null
  storesError: any | null
}> {
  const supabase = createClient()

  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('*')
    .eq('name', name)

  return { stores, storesError }
}
