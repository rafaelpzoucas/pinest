'use server'

import { createClient } from '@/lib/supabase/server'
import { convertStringToNumber, generateSlug } from '@/lib/utils'
import { ProductType } from '@/models/product'
import { StoreType } from '@/models/store'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { newProductFormSchema } from './form/form'

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
): Promise<{
  createdProduct: ProductType | null
  createdProductError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const { data: createdProduct, error: createdProductError } = await supabase
    .from('products')
    .insert({
      ...values,
      name: values.name?.trim(),
      description: values.description?.trim(),
      price: values.price && convertStringToNumber(values.price),
      promotional_price:
        values.promotional_price &&
        convertStringToNumber(values.promotional_price),
      pkg_weight: values.pkg_weight && convertStringToNumber(values.pkg_weight),
      store_id: store?.id,
      product_url: values.name && generateSlug(values.name.trim()),
    })
    .select()
    .single()

  revalidatePath('/catalog')

  return { createdProduct, createdProductError }
}

export async function readProductById(productId: string): Promise<{
  product: ProductType | null
  productError: any | null
}> {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      `
        *,
        product_variations (
          *,
          attributes (*)
        )
      `,
    )
    .eq('id', productId)
    .single()

  return { product, productError }
}

export async function updateProduct(
  id: string,
  values: z.infer<typeof newProductFormSchema>,
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...values,
      name: values.name?.trim(),
      description: values.description?.trim(),
      price: values.price && convertStringToNumber(values.price),
      promotional_price:
        values.promotional_price &&
        convertStringToNumber(values.promotional_price),
      pkg_weight: values.pkg_weight && convertStringToNumber(values.pkg_weight),
      product_url: values.name && generateSlug(values.name.trim()),
    })
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

export async function readProductVariations(productId: string) {
  const supabase = createClient()

  const { data: productVariations, error: productVariationsError } =
    await supabase
      .from('product_variations')
      .select(
        `
          *,
          attributes (*)
        `,
      )
      .eq('product_id', productId)

  return { productVariations, productVariationsError }
}
