'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction, ZSAError } from 'zsa'
import { readStoreIdBySlug } from '../store/read'
import { ReadStoreShippingsSchema, Shippings } from './schemas'

export const readStoreShippings = createServerAction()
  .input(ReadStoreShippingsSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const [storeData] = await readStoreIdBySlug({ storeSlug: input.subdomain })

    const { data: storeShippings, error: storeShippingsError } = await supabase
      .from('shippings')
      .select('*')
      .eq('store_id', storeData?.storeId)
      .single()

    if (storeShippingsError) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', storeShippingsError.message)
    }

    return { storeShippings: storeShippings as Shippings }
  })
