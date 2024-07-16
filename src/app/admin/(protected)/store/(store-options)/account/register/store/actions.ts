'use server'

import { createClient } from '@/lib/supabase/server'

import { removeAccents } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { storeSchema } from './form'

export async function readStoreById(storeId: string): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  return { store, storeError }
}

export async function updateStore(
  columns: z.infer<typeof storeSchema>,
  id: string,
) {
  const newColumns = {
    ...columns,
    name: columns.name.trim(),
    store_url: removeAccents(columns.name.trim())
      .toLowerCase()
      .replaceAll(' ', '-'),
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
