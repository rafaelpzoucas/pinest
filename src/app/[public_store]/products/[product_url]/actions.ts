'use server'

import { readStoreByStoreURL } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import { createClient } from '@/lib/supabase/server'
import { ProductType, ProductVariationType } from '@/models/product'
import { readStoreByName } from '../../checkout/@summary/actions'

export async function readProductByURL(
  storeURL: string,
  productURL: string,
): Promise<{
  product: ProductType
  productError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByName(storeURL)

  if (storeError) {
    console.error(storeError)
  }

  const { data: products, error: productError } = await supabase
    .from('products')
    .select(
      `
        *,
        product_images (*)
      `,
    )
    .eq('product_url', productURL)
    .eq('store_id', store?.id)

  const product = products && products.length > 0 && products[0]

  return { product, productError }
}

export async function readProductVariations(
  storeURL: string,
  productURL: string,
): Promise<{
  variations: ProductVariationType[] | null
  variationsError: any | null
}> {
  const supabase = createClient()

  const { product, productError } = await readProductByURL(storeURL, productURL)

  if (productError) {
    console.error(productError)
  }

  const { data: variations, error: variationsError } = await supabase
    .from('product_variations')
    .select(
      `
        *,
        attributes (*)
      `,
    )
    .eq('product_id', product.id)

  return { variations, variationsError }
}

export async function readExtras(storeURL: string) {
  const supabase = createClient()

  const { store, readStoreError } = await readStoreByStoreURL(storeURL)

  if (readStoreError) {
    console.error(readStoreError)
    throw new Error('Não foi possível encontrar a loja', readStoreError)
  }

  const { data, error } = await supabase
    .from('extras')
    .select('*')
    .eq('store_id', store?.id)

  if (error) {
    console.error(error)
    throw new Error('Não foi possível ler os adicionais.', error)
  }

  return { data, error }
}
