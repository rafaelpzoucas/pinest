'use server'

import { adminProcedure } from '@/lib/zsa-procedures'

export const readStoreData = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const [
      { data: categories, error: categoriesError },
      { data: products, error: productsError },
      { data: extras, error: extrasError },
      { data: shippings, error: shippingsError },
    ] = await Promise.all([
      supabase.from('categories').select('*').eq('store_id', store.id),
      supabase.from('products').select('*').eq('store_id', store.id),
      supabase.from('extras').select('*').eq('store_id', store.id),
      supabase.from('shippings').select('*').eq('store_id', store.id).single(),
    ])

    if (categoriesError || productsError || extrasError || shippingsError) {
      throw new Error('Failed to read store data', {
        cause: { categoriesError, productsError, extrasError, shippingsError },
      })
    }

    return { categories, products, extras, shippings }
  })
