'use server'

import { createClient } from '@/lib/supabase/server'
import { ShippingConfigType } from '@/models/shipping'
import { createServerAction, ZSAError } from 'zsa'
import { readAdminShippingSchema } from './schemas'

export const readAdminShippingServer = createServerAction()
  .input(readAdminShippingSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: shipping, error: shippingError } = await supabase
      .from('shippings')
      .select('*')
      .eq('store_id', input.storeId)
      .single()

    if (shippingError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        shippingError.message ?? 'Error fetching shipping.',
      )
    }

    return { shipping: shipping as ShippingConfigType }
  })
