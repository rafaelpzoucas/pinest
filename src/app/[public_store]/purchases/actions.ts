import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'

export async function readPurchases(): Promise<{
  purchases: PurchaseType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { data: purchases, error } = await supabase.from('purchases').select(`
    *,
    purchase_items (
      *,
      products (
        *
      )
    )
  `)

  return { purchases, error }
}
