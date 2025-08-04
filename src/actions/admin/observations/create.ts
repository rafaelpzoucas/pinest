'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction, ZSAError } from 'zsa'
import { createAdminObservationSchema } from './schemas'

export const createAdminObservationServer = createServerAction()
  .input(createAdminObservationSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: existing, error: selectError } = await supabase
      .from('observations')
      .select('id')
      .eq('store_id', input.storeId)
      .eq('observation', input.observation.toLowerCase())
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        selectError.message ?? 'Error selecting existing observation.',
      )
    }

    if (existing) {
      throw new ZSAError('CONFLICT', 'Duplicated observation.')
    }

    const { data: createdObservationData, error: insertError } = await supabase
      .from('observations')
      .insert({
        store_id: input.storeId,
        observation: input.observation.toLowerCase(),
      })
      .select()
      .maybeSingle()

    if (insertError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        insertError.message ?? 'Error creating observation.',
      )
    }

    return { createdObservation: createdObservationData }
  })
