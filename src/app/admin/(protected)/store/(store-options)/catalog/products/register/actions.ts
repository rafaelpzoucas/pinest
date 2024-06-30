'use server'

import { createClient } from '@/lib/supabase/server'
import { StoreType } from '@/models/store'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { newProductFormSchema } from './form'

export async function readStoreByUserId(): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', session.user?.id)
    .single()

  return { store, storeError }
}

export async function createProduct(
  values: z.infer<typeof newProductFormSchema>,
) {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...values, store_id: store?.id })
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
