'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { cache } from 'react'

export const readStoreData = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const [
      { data: categories, error: categoriesError },
      { data: products, error: productsError },
      { data: extras, error: extrasError },
    ] = await Promise.all([
      supabase.from('categories').select('*').eq('store_id', store.id),
      supabase.from('products').select('*').eq('store_id', store.id),
      supabase.from('extras').select('*').eq('store_id', store.id),
    ])

    if (categoriesError || productsError || extrasError) {
      throw new Error('Failed to read store data', {
        cause: { categoriesError, productsError, extrasError },
      })
    }

    return { categories, products, extras }
  })

export const readStoreDataCached = cache(readStoreData)
