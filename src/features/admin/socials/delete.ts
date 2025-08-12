'use server'

import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { deleteAdminStoreSocialSchema } from './schemas'

export const deleteAdminStoreSocial = authenticatedProcedure
  .createServerAction()
  .input(deleteAdminStoreSocialSchema)
  .handler(async ({ input, ctx }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('store_socials')
      .delete()
      .eq('id', input.id)

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }
  })
