import { createClient } from '@/lib/supabase/server'
import { ShippingConfigType } from '@/models/shipping'
import { readStoreByName } from '../../checkout/@summary/actions'

export async function readOwnShipping(storeName: string): Promise<{
  shipping: ShippingConfigType | null
  shippingError: any | null
}> {
  const supabase = createClient()

  const { store } = await readStoreByName(storeName)

  const { data: shipping, error: shippingError } = await supabase
    .from('shippings')
    .select('*')
    .eq('store_id', store?.id)
    .single()

  if (shippingError) {
    console.error(shippingError)
  }

  return {
    shipping,
    shippingError,
  }
}
