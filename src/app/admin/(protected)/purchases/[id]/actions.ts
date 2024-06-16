import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'

export async function readPurchaseById(purchaseId: string): Promise<{
  purchase: PurchaseType | null
  purchaseError: any | null
}> {
  const supabase = createClient()

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select(
      `
      *,
      purchase_items (
        *,
        products (*)
      ),
      customers (
        *,
        users (*)
      ),
      addresses (*)
      `,
    )
    .eq('id', purchaseId)
    .single()

  return { purchase, purchaseError }
}
