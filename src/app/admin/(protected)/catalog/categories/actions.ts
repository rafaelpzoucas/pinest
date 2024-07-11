'use server'

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

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', session.user?.id)
    .single()

  if (storeError) {
    console.error(storeError)
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...values, store_id: store?.id }])
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function readCategoriesByStore(storeId?: string): Promise<{
  data: CategoryType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', storeId)

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
