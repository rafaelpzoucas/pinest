'use server'

import { createClient } from '@/lib/supabase/server'
import { ProductType } from '@/models/product'
import { createServerAction, ZSAError } from 'zsa'
import { readStoreProductsSchema } from './schemas'

export const readAdminProductsServer = createServerAction()
  .input(readStoreProductsSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', input.storeId)

    if (productsError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        productsError.message ?? 'Error fetching products.',
      )
    }

    return { products: products as ProductType[] }
  })
