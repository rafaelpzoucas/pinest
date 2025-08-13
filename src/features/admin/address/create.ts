'use server'

import { authedWithStoreIdProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { createAddressSchema } from './schemas'

export const createAdminAddress = authedWithStoreIdProcedure
  .createServerAction()
  .input(createAddressSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, storeId } = ctx

    const { error } = await supabase
      .from('addresses')
      .insert({ ...input, store_id: storeId })

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }
  })
