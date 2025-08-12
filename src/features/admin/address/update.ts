'use server'

import { authedWithStoreIdProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { updateAddressSchema } from './schemas'

export const updateAdminAddress = authedWithStoreIdProcedure
  .createServerAction()
  .input(updateAddressSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, storeId } = ctx

    const { error } = await supabase
      .from('addresses')
      .update(input)
      .eq('store_id', storeId)

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }
  })
