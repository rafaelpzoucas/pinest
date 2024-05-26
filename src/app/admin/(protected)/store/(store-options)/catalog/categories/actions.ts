'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { newCategoryFormSchema } from './register/form'

const supabase = createClient()

export type CategoryType = {
  id: string
  name: string
  description: string
  created_at: string
}

export async function createCategory(
  values: z.infer<typeof newCategoryFormSchema>,
) {
  const { data, error } = await supabase
    .from('categories')
    .insert([values])
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function readCategories(): Promise<{
  data: CategoryType[] | null
  error: any | null
}> {
  const { data, error } = await supabase.from('categories').select('*')

  return { data, error }
}

export async function updateCategory(
  id: string,
  values: z.infer<typeof newCategoryFormSchema>,
) {
  const { data, error } = await supabase
    .from('categories')
    .update(values)
    .eq('id', id)
    .select()

  revalidatePath('/catalog')

  return { data, error }
}
