'use server'

import { adminProcedure } from '@/lib/zsa-procedures'

export const readProducts = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: products, error: readProductsError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)

    if (readProductsError) {
      throw new Error('Failed to read products', readProductsError)
    }

    return { products }
  })
