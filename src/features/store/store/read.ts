'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'
import { Store } from './schemas'

export const readStoreBySlug = createServerAction()
  .input(z.object({ storeSlug: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('store_subdomain', input.storeSlug)
      .single()

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }

    return { store: data as Store }
  })

export const readStoreIdBySlug = createServerAction()
  .input(z.object({ storeSlug: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('store_subdomain', input.storeSlug)
      .single()

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }

    return { storeId: data.id }
  })
