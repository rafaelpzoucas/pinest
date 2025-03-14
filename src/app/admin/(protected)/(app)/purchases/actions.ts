'use server'

import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'

async function readStore(): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', session.user?.id)
    .single()

  return { store, storeError }
}

export async function readPurchases(): Promise<{
  purchases: PurchaseType[] | null
  purchasesError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStore()

  if (storeError) {
    console.error(storeError)
  }

  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select(
      `
      *,
      purchase_items (*),
      customers (
        *,
        users (
          *,
          addresses (*)
        )
      )
    `,
    )
    .eq('store_id', store?.id)
    .order('created_at', { ascending: false })

  return { purchases, purchasesError }
}
