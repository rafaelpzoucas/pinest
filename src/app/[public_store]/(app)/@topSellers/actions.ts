'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'

export async function getTopSellers(): Promise<{
  topSellers: ProductType[] | null
  topSellersError: any | null
}> {
  const supabase = createClient()

  const { data: topSellers, error: topSellersError } = await supabase
    .from('products')
    .select(
      `
      *,
      product_images (*)  
    `,
    )
    .range(0, 9)
    .order('amount_sold', { ascending: false })

  return { topSellers, topSellersError }
}
