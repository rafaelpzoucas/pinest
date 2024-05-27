'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { newProductFormSchema } from './register/form'

const supabase = createClient()

export type ProductType = {
  id: string
  name: string
  description: string
  created_at: string
}

export async function createProduct(
  values: z.infer<typeof newProductFormSchema>,
) {
  const { data, error } = await supabase
    .from('products')
    .insert([values])
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function readProducts(): Promise<{
  data: ProductType[] | null
  error: any | null
}> {
  const { data, error } = await supabase.from('products').select('*')

  return { data, error }
}

export async function updateProduct(
  id: string,
  values: z.infer<typeof newProductFormSchema>,
) {
  const { data, error } = await supabase
    .from('products')
    .update(values)
    .eq('id', id)
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)

  revalidatePath('/catalog')

  return { error }
}
