import { createClient } from '@/lib/supabase/server'

export async function readStoreKanguToken(storeId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('shippings')
    .select('carrier_token')
    .eq('store_id', storeId)
    .single()

  return data?.carrier_token
}
