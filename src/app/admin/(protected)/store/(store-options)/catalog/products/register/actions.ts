'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { newProductFormSchema } from './form'

export async function createProduct(
  values: z.infer<typeof newProductFormSchema>,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .insert([values])
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function updateProduct(
  id: string,
  values: z.infer<typeof newProductFormSchema>,
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .update(values)
    .eq('id', id)
    .select()

  revalidatePath('/catalog')

  return { data, error }
}

export async function deleteProductImage(imageId: string) {
  const supabase = createClient()

  const { error: tableError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)

  const { error: storageError } = await supabase.storage
    .from('products-images')
    .remove([`products/${imageId}`])

  revalidatePath('/catalog')

  return { tableError, storageError }
}
