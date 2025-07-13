'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { cache } from 'react'
import { z } from 'zod'

export const getSearchedProducts = storeProcedure
  .createServerAction()
  .input(z.object({ query: z.string() }))
  .handler(async ({ ctx, input }) => {
    console.time('getSearchedProducts')
    const { store, supabase } = ctx
    const { query } = input

    console.time('sanitizeQuery')
    const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`
    console.timeEnd('sanitizeQuery')

    console.time('searchProductsDB')
    const { data: products, error: searchError } = await supabase
      .from('products')
      .select(
        `
        *,
        product_images (*)
      `,
      )
      .eq('store_id', store.id)
      .ilike('name', sanitizedQuery)
    console.timeEnd('searchProductsDB')

    if (searchError || !products) {
      console.error('Erro ao buscar produtos.', searchError)
      console.timeEnd('getSearchedProducts')
      return null
    }

    console.timeEnd('getSearchedProducts')
    return { products }
  })

export const getSearchedProductsCached = cache(getSearchedProducts)
