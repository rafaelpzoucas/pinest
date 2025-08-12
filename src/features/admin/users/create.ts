'use server'

import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { AdminUser } from './schemas'

export const createAdminUser = authenticatedProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user?.id,
        name: user?.user_metadata.name ?? null,
        phone: user?.user_metadata.phone ?? null,
        email: user?.email,
        role: 'admin',
      })
      .select()
      .single()

    if (error) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        `Could not create user, cause: ${error.message}`,
      )
    }

    return { createdAdminUser: data as AdminUser }
  })
