'use server'

import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'

export async function readPurchaseById(id: string): Promise<{
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
        products (
          *,
          product_images (*)
        )
      ),
      addresses (*)
    `,
    )
    .eq('id', id)
    .single()

  return { purchase, purchaseError }
}
