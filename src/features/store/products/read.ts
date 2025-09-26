'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'
import { Product } from './schemas'

export const readProductBySlug = createServerAction()
  .input(z.object({ productSlug: z.string(), storeId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('products')
      .select(
        `
          *, 
          product_images(*)
        `,
      )
      .eq('product_url', input.productSlug)
      .eq('store_id', input.storeId)
      .single()

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }

    return { product: data as Product }
  })
