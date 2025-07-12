'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { cache } from 'react'
import { z } from 'zod'
import { generateRequestId, logCpu } from '../utils'

export const getSearchedProducts = storeProcedure
  .createServerAction()
  .input(z.object({ query: z.string() }))
  .handler(async ({ ctx, input }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::getSearchedProducts`, async () => {
      const { store, supabase } = ctx
      const { query } = input

      const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`

      const { data: products, error: searchError } = await logCpu(
        `${requestId}::searchProductsDB`,
        async () => {
          return await supabase
            .from('products')
            .select(
              `
            *,
            product_images (*)
          `,
            )
            .eq('store_id', store.id)
            .ilike('name', sanitizedQuery)
        },
      )

      if (searchError || !products) {
        console.error('Erro ao buscar produtos.', searchError)
        return null
      }

      return { products }
    })
  })

export const getSearchedProductsCached = cache(getSearchedProducts)
