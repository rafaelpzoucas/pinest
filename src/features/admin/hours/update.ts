'use server'

import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { revalidateTag } from 'next/cache'
import { updateStoreHoursSchema } from './schemas'

export const updateAdminStoreHours = authenticatedProcedure
  .createServerAction()
  .input(updateStoreHoursSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const weekDays = input.week_days

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

    revalidateTag('store-hours')

    return { updatedHours, updateHoursErrors }
  })
