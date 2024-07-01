'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { getStoreByStoreURL } from '../../actions'

export async function getTopSellers(storeURL: string): Promise<{
  topSellers: ProductType[] | null
  topSellersError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await getStoreByStoreURL(storeURL)

  if (storeError) {
    console.error(storeError)
  }

  const { data: topSellers, error: topSellersError } = await supabase
    .from('products')
    .select(
      `
      *,
      product_images (*)  
    `,
    )
    .eq('store_id', store?.id)
    .range(0, 9)
    .order('amount_sold', { ascending: false })

  return { topSellers, topSellersError }
}
