'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { revalidatePath } from 'next/cache'

export async function readProductById(productId: string) {
  const supabase = createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)

  const product = products && products.length > 0 && products[0]

  return { product, error }
}

export async function addProductToCart(product: ProductType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cart_products')
    .insert([{}])
    .select()

  revalidatePath('/[public_store]')

  return { data, error }
}
