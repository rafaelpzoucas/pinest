import { createClient } from '@/lib/supabase/client'
import { ExtraType } from '@/models/extras'
import { ProductType, ProductVariationType } from '@/models/product'
import { z } from 'zod'

const readProductSchema = z.object({
  productURL: z.string(),
  storeId: z.string().optional(),
})

const readProductVariationsSchema = z.object({
  productId: z.string().optional(),
})

const readExtrasSchema = z.object({
  storeId: z.string().optional(),
  productId: z.string().optional(),
})

type ReadProduct = z.infer<typeof readProductSchema>
type ReadProductVariations = z.infer<typeof readProductVariationsSchema>
type ReadExtras = z.infer<typeof readExtrasSchema>

export async function readProductByURL(input: ReadProduct) {
  const supabase = createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select(
      `
        *,
        product_images (*)
      `,
    )
    .eq('product_url', input.productURL)
    .eq('store_id', input.storeId)
    .single()

  if (productError) {
    throw new Error('Erro ao buscar produto.', productError)
  }

  return { product: product as ProductType }
}

export async function readProductVariations(input: ReadProductVariations) {
  const supabase = createClient()

  const { data: variations, error: variationsError } = await supabase
    .from('product_variations')
    .select(
      `
      *,
      attributes (*)
    `,
    )
    .eq('product_id', input.productId)

  if (variationsError) {
    console.error(
      'Não foi possível ler as variações do produto.',
      variationsError,
    )
  }

  return { variations: variations as ProductVariationType[] }
}

export async function readExtras(input: ReadExtras) {
  const supabase = createClient()

  const { data: extras, error } = await supabase.rpc('get_extras_for_product', {
    p_store_id: input.storeId,
    p_product_id: input.productId || null,
  })

  if (error) {
    console.error(error)
    throw new Error('Não foi possível ler os adicionais.')
  }

  return { extras: extras as ExtraType[] }
}
