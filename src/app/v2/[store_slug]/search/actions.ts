'use server'

import { readStoreIdBySlug } from '@/features/store/store/read'
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const getSearchedProducts = createServerAction()
  .input(z.object({ storeSlug: z.string(), query: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { query } = input

    const [storeIdData] = await readStoreIdBySlug({
      storeSlug: input.storeSlug,
    })

    const sanitizedQuery = `%${query.replace(/[^a-zA-Z0-9 ]/g, '')}%`

    const { data: products, error: searchError } = await supabase
      .from('products')
      .select(
        `
        *,
        product_images (*)
      `,
      )
      .eq('store_id', storeIdData?.storeId)
      .ilike('name', sanitizedQuery)

    if (searchError || !products) {
      console.error('Erro ao buscar produtos.', searchError)
      return null
    }

    return { products }
  })

export const getSearchedProductsCached = cache(getSearchedProducts)
