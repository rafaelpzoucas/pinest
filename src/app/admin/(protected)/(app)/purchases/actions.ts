'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
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
    .neq('is_paid', true)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  return { purchases, purchasesError }
}

export const readTables = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: tables, error: readTablesError } = await supabase
      .from('tables')
      .select(
        `
          *,
          purchase_items (
            *,
            products (*)
          )
        `,
      )
      .eq('store_id', store.id)

    if (readTablesError || !tables) {
      console.error('Não foi possível buscar as mesas.', readTablesError)
    }

    return { tables }
  })
