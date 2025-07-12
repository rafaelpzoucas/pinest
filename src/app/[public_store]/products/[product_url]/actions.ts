'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { ExtraType } from '@/models/extras'
import { ProductType, ProductVariationType } from '@/models/product'
import { cache } from 'react'
import { z } from 'zod'

export const readProductByURL = storeProcedure
  .createServerAction()
  .input(z.object({ productURL: z.string() }))
  .handler(async ({ ctx, input }) => {
    console.time('readProductByURL')
    const { store, supabase } = ctx

    console.time('fetchProductDB')
    const { data: products, error: productError } = await supabase
      .from('products')
      .select(
        `
        *,
        product_images (*)
      `,
      )
      .eq('product_url', input.productURL)
      .eq('store_id', store?.id)
    console.timeEnd('fetchProductDB')

    const product = products && products.length > 0 && products[0]

    console.timeEnd('readProductByURL')
    return { product: product as ProductType }
  })

export const readProductVariations = storeProcedure
  .createServerAction()
  .input(z.object({ productURL: z.string() }))
  .handler(async ({ ctx, input }) => {
    console.time('readProductVariations')
    const { supabase } = ctx

    console.time('getProductForVariations')
    const [productData] = await readProductByURL({
      productURL: input.productURL,
    })
    console.timeEnd('getProductForVariations')

    const product = productData?.product

    console.time('fetchVariationsDB')
    const { data: variations, error: variationsError } = await supabase
      .from('product_variations')
      .select(
        `
        *,
        attributes (*)
      `,
      )
      .eq('product_id', product?.id)
    console.timeEnd('fetchVariationsDB')

    if (variationsError) {
      console.error(
        'Não foi possível ler as variações do produto.',
        variationsError,
      )
    }

    console.timeEnd('readProductVariations')
    return { variations: variations as ProductVariationType[] }
  })

export const readExtras = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readExtras')
    const { supabase, store } = ctx

    console.time('fetchExtrasDB')
    const { data: extras, error } = await supabase
      .from('extras')
      .select('*')
      .eq('store_id', store?.id)
    console.timeEnd('fetchExtrasDB')

    if (error) {
      console.error(error)
      throw new Error('Não foi possível ler os adicionais.', error)
    }

    console.timeEnd('readExtras')
    return { extras: extras as ExtraType[] }
  })

export const readProductByURLCached = cache(readProductByURL)
export const readProductVariationsCached = cache(readProductVariations)
export const readExtrasCached = cache(readExtras)
