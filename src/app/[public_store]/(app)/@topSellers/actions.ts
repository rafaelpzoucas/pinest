'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { readStoreByName } from '../@header/actions'

export async function getTopSellers(storeName?: string): Promise<{
  topSellers: ProductType[] | null
  topSellersError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByName(storeName)

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
