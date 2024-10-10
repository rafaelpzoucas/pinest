'use server'

import { createClient } from '@/lib/supabase/server'
import { readStoreByUserId } from '../../actions'
import { HoursFormValues } from './form'

export async function createStoreHours(values: HoursFormValues) {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const storeHours = values.week_days.map((hour) => ({
    ...hour,
    store_id: store?.id,
  }))

  const { data: createdHours, error: createHoursError } = await supabase
    .from('store_hours')
    .insert(storeHours)

  return { createdHours, createHoursError }
}
