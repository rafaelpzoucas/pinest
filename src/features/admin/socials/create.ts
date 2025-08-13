'use server'

import { authedWithStoreIdProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { createAdminStoreSocialsSchema } from './schemas'

export const createAdminStoreSocials = authedWithStoreIdProcedure
  .createServerAction()
  .input(createAdminStoreSocialsSchema)
  .handler(async ({ ctx, input }) => {
    const { storeId, supabase } = ctx

    const socialsToAdd = input.socials.map((social) => ({
      ...social,
      store_id: storeId,
    }))

    const { error: createSocialError } = await supabase
      .from('store_socials')
      .insert(socialsToAdd)

    if (createSocialError) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', createSocialError.message)
    }
  })
