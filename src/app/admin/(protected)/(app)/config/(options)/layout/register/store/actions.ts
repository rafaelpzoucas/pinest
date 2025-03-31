'use server'

import { createClient } from '@/lib/supabase/server'

import { generateSlug } from '@/lib/utils'
import { adminProcedure } from '@/lib/zsa-procedures'
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
        market_niches (*),
        addresses (*),
        users (*)
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

export const removeStoreLogo = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('stores')
      .update({ logo_url: null })
      .eq('id', store.id)

    if (error) {
      console.error('Erro ao atualizar a coluna logo_url', error)
      return
    }

    await deleteImageFromBucket({ bucket: 'logos', path: store.logo_url })

    revalidatePath('/admin')

    return { data, error }
  })

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

export const deleteImageFromBucket = adminProcedure
  .createServerAction()
  .input(z.object({ bucket: z.string(), path: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { bucket, path } = input

    const filePath = path.split(`/public/${bucket}/`)[1]

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error('Error deleting image from bucket', error)
    } else {
      revalidatePath('/admin')
    }
  })
