'use server'

import { createClient } from '@/lib/supabase/server'
import { ObservationType } from '@/models/observation'
import { createServerAction } from 'zsa'
import { readAdminObservationsSchema } from './schemas'

export const readAdminObservationsServer = createServerAction()
  .input(readAdminObservationsSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('observations')
      .select('*')
      .eq('store_id', input.storeId)

    if (error) {
      console.error('Erro ao buscar observações', error)
      return
    }

    return { observations: data as ObservationType[] }
  })
