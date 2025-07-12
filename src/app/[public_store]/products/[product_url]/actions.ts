'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { ExtraType } from '@/models/extras'
import { ProductType, ProductVariationType } from '@/models/product'
import { cache } from 'react'
import { z } from 'zod'
import { generateRequestId, logCpu } from '../../utils'

export const readProductByURL = storeProcedure
  .createServerAction()
  .input(z.object({ productURL: z.string() }))
  .handler(async ({ ctx, input }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readProductByURL`, async () => {
      const { store, supabase } = ctx

      const { data: products, error: productError } = await logCpu(
        `${requestId}::fetchProductDB`,
        async () => {
          return await supabase
            .from('products')
            .select(
              `
            *,
            product_images (*)
          `,
            )
            .eq('product_url', input.productURL)
            .eq('store_id', store?.id)
        },
      )

      const product = products && products.length > 0 && products[0]

      return { product: product as ProductType }
    })
  })

export const readProductVariations = storeProcedure
  .createServerAction()
  .input(z.object({ productURL: z.string() }))
  .handler(async ({ ctx, input }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readProductVariations`, async () => {
      const { supabase } = ctx

      const [productData] = await logCpu(
        `${requestId}::getProductForVariations`,
        async () => {
          return await readProductByURL({
            productURL: input.productURL,
          })
        },
      )

      const product = productData?.product

      const { data: variations, error: variationsError } = await logCpu(
        `${requestId}::fetchVariationsDB`,
        async () => {
          return await supabase
            .from('product_variations')
            .select(
              `
            *,
            attributes (*)
          `,
            )
            .eq('product_id', product?.id)
        },
      )

      if (variationsError) {
        console.error(
          'Não foi possível ler as variações do produto.',
          variationsError,
        )
      }

      return { variations: variations as ProductVariationType[] }
    })
  })

export const readExtras = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readExtras`, async () => {
      const { supabase, store } = ctx

      const { data: extras, error } = await logCpu(
        `${requestId}::fetchExtrasDB`,
        async () => {
          return await supabase
            .from('extras')
            .select('*')
            .eq('store_id', store?.id)
        },
      )

      if (error) {
        console.error(error)
        throw new Error('Não foi possível ler os adicionais.', error)
      }

      return { extras: extras as ExtraType[] }
    })
  })

export const readProductByURLCached = cache(readProductByURL)
export const readProductVariationsCached = cache(readProductVariations)
export const readExtrasCached = cache(readExtras)
