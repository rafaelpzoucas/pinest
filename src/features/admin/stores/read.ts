import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { ZSAError } from 'zsa'
import { AdminStore } from './schemas'

export const readAdminStore = authenticatedProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, user } = ctx

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user?.id)
      .single()

    if (error) {
      throw new ZSAError('NOT_FOUND', 'Could not find Admin Store')
    }

    return { store: data as AdminStore }
  })
