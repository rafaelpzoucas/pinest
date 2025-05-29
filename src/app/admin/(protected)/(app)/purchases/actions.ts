'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
import { ObservationType } from '@/models/observation'
import { PurchaseType } from '@/models/purchase'
import { StoreType } from '@/models/store'
import { z } from 'zod'

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
      purchase_items (
        *,  
        products (*)
      ),
      store_customers (
        *,
        customers (*)
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
      .eq('status', 'open')

    if (readTablesError || !tables) {
      console.error('Não foi possível buscar as mesas.', readTablesError)
    }

    return { tables }
  })

export const insertObservation = adminProcedure
  .createServerAction()
  .input(z.object({ observation: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data, error: selectError } = await supabase
      .from('observations')
      .select('id')
      .eq('store_id', store.id)
      .eq('observation', input.observation.toLowerCase())
      .single()

    if (selectError && selectError.code !== 'PGRST100') {
      console.error('Erro ao verificar duplicação da observação:', selectError)
    }

    if (data) {
      console.log('Observação já existe:', input.observation)
      return
    }

    const { error } = await supabase
      .from('observations')
      .insert([
        { store_id: store.id, observation: input.observation.toLowerCase() },
      ])

    if (error) {
      console.error('Erro ao salvar a observação:', error)
    }
  })

export const readObservations = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('observations')
      .select('*')
      .eq('store_id', store.id)

    if (error) {
      console.error('Erro ao buscar observações', error)
      return
    }

    return { observations: data as ObservationType[] }
  })
