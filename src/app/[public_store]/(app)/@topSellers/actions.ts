'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTopSellers() {
  const supabase = createClient()

  const { data: topSellers, error: topSellersError } = await supabase
    .from('products')
    .select('*')
    .range(0, 10)

  return { topSellers, topSellersError }
}
