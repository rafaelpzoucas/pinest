'use server'

import { readStoreByName } from '@/app/[public_store]/(app)/@header/actions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { newCategoryFormSchema } from './register/form'

export type CategoryType = {
  id: string
  name: string
  description: string
  created_at: string
}

export async function createCategory(
  values: z.infer<typeof newCategoryFormSchema>,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .insert([values])
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function readCategoriesByStore(storeName: string): Promise<{
  data: CategoryType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByName(storeName)

  if (storeError) {
    console.error(storeError)
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store?.id)

  return { data, error }
}

export async function updateCategory(
  id: string,
  values: z.infer<typeof newCategoryFormSchema>,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .update(values)
    .eq('id', id)
    .select()

  revalidatePath('/catalog')

  return { data, error }
}
