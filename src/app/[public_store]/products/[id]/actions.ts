'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType, ProductVariationType } from '@/models/product'

export async function readProductById(productId: string): Promise<{
  product: ProductType
  productError: any | null
}> {
  const supabase = createClient()
  const { data: products, error: productError } = await supabase
    .from('products')
    .select(
      `
        *,
        product_images (*)
      `,
    )
    .eq('id', productId)

  const product = products && products.length > 0 && products[0]

  return { product, productError }
}

export async function readProductVariations(productId: string): Promise<{
  variations: ProductVariationType[] | null
  variationsError: any | null
}> {
  const supabase = createClient()
  const { data: variations, error: variationsError } = await supabase
    .from('product_variations')
    .select(
      `
        *,
        attributes (*)
      `,
    )
    .eq('product_id', productId)

  return { variations, variationsError }
}
