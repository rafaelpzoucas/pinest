'use server'

import { createClient } from '@/lib/supabase/server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { storeSchema } from './form'

export async function updateStore(
  columns: z.infer<typeof storeSchema>,
  id: string,
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stores')
    .update(columns)
    .eq('id', id)

  return { data, error }
}

export async function removeStoreLogo(name: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stores')
    .update({ logo_url: null })
    .eq('name', name)

  revalidatePath('/admin/store')

  return { data, error }
}
