'use server'

import { createClient } from '@/lib/supabase/server'
import { ExtraType } from '@/models/extras'
import { createServerAction, ZSAError } from 'zsa'
import { readAdminExtrasSchema } from './schemas'

export const readAdminExtrasServer = createServerAction()
  .input(readAdminExtrasSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: extras, error: extrasError } = await supabase
      .from('extras')
      .select('*')
      .eq('store_id', input.storeId)

    if (extrasError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        extrasError.message ?? 'Error fetching extras.',
      )
    }

    return { extras: extras as ExtraType[] }
  })
