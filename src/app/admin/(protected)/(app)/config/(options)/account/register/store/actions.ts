'use server'

import { createClient } from '@/lib/supabase/server'

import { generateSlug } from '@/lib/utils'
import { MarketNicheType } from '@/models/market-niches'
import { StoreType } from '@/models/store'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { storeSchema } from './form'

export async function readStoreById(storeId: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select(
      `
        *,
        market_niches (*)
      `,
    )
    .eq('id', storeId)
    .single()

  return { store, storeError }
}

export async function createStore(
  columns: z.infer<typeof storeSchema>,
): Promise<{
  storeError: any | null
}> {
  const newColumns = {
    ...columns,
    name: columns.name.trim().toLowerCase(),
    store_url: generateSlug(columns.name.trim()),
  }
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)

    redirect('/admin/sign-in')
  }

  const { error: storeError } = await supabase
    .from('stores')
    .insert({ user_id: session.user.id, ...newColumns })

  return { storeError }
}

export async function updateStore(
  columns: z.infer<typeof storeSchema>,
  id: string,
) {
  const newColumns = {
    ...columns,
    name: columns.name.trim(),
    store_url: generateSlug(columns.name.trim()),
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('stores')
    .update(newColumns)
    .eq('id', id)

  return { data, error }
}

export async function removeStoreLogo(storeId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stores')
    .update({ logo_url: null })
    .eq('id', storeId)

  revalidatePath('/admin')

  return { data, error }
}

export async function readMarketNiches(): Promise<{
  marketNiches: MarketNicheType[] | null
  readNichesError: any | null
}> {
  const supabase = createClient()
  const { data: marketNiches, error: readNichesError } = await supabase
    .from('market_niches')
    .select('*')

  return { marketNiches, readNichesError }
}
