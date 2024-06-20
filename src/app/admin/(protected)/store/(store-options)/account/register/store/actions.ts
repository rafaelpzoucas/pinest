'use server'

import { createClient } from '@/lib/supabase/server'
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
