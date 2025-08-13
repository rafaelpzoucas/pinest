'use server'

import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { updateAdminStoreSocialsSchema } from './schemas'

export const updateAdminStoreSocials = authenticatedProcedure
  .createServerAction()
  .input(updateAdminStoreSocialsSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('store_socials')
      .upsert(input.socials, {
        onConflict: 'id',
      })

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }
  })
