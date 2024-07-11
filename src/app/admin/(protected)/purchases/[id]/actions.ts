'use server'

import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { revalidatePath } from 'next/cache'

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

export async function updatePurchaseStatus(
  newStatus: string,
  purchaseId: string,
) {
  const supabase = createClient()

  const { error: updateStatusError } = await supabase
    .from('purchases')
    .update({ status: newStatus })
    .eq('id', purchaseId)

  if (updateStatusError) {
    console.error(updateStatusError)
  }

  revalidatePath('/purchases')
}
