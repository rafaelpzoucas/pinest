'use server'

import { createClient } from '@/lib/supabase/server'
import { CategoryType } from '@/models/category'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readUser } from '../../config/(options)/account/actions'
import { newCategoryFormSchema } from './register/form'

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

export async function readCategoriesByStore(): Promise<{
  data: CategoryType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { data: user, error: readUserError } = await readUser()

  if (readUserError) {
    console.error(readUserError)
  }

  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        *,
        products (
          *,
          product_images (*)
        )
      `,
    )
    .eq('store_id', user?.stores[0].id)

  return { data, error }
}

export async function readCategoryById(
  categoryId: string,
): Promise<{ category: CategoryType }> {
  const supabase = createClient()

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (categoryError) {
    console.error(categoryError)
  }

  return { category }
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
