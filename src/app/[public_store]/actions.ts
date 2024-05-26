'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStores(name: string) {
  const supabase = createClient()

  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .eq('name', name)

  return { stores, error }
}
