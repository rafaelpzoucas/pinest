'use server'

import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { AdminUser } from './schemas'

export const readAdminUser = authenticatedProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single()

    // ✅ Não encontrou = retorna null, não é erro
    if (error && error.code === 'PGRST116') {
      // Not found
      return { adminUser: null }
    }

    // ✅ Erro real de banco = throw
    if (error) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        `Database error: ${error.message}`,
      )
    }

    return { adminUser: data as AdminUser }
  })
