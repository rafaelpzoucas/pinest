'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function updateStoreHours(values: HoursFormValues) {
  const supabase = createClient()

  const weekDays = values.week_days

  const results = await Promise.all(
    weekDays.map(async (day) => {
      const { data, error } = await supabase
        .from('store_hours')
        .update({
          is_open: day.is_open,
          open_time: day.open_time,
          close_time: day.close_time,
        })
        .eq('id', day.id)

      return { data, error }
    }),
  )

  // Separar dados e erros
  const updatedHours = results.map((result) => result.data).filter(Boolean)
  const updateHoursErrors = results
    .map((result) => result.error)
    .filter(Boolean)

  revalidatePath('/admin/config/account')

  return { updatedHours, updateHoursErrors }
}
