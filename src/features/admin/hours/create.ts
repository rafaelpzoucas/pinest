'use server'

import { authedWithStoreIdProcedure } from '@/lib/zsa-procedures'
import { createStoreHoursSchema } from './schemas'

export const createAdminStoreHours = authedWithStoreIdProcedure
  .createServerAction()
  .input(createStoreHoursSchema)
  .handler(async ({ ctx, input }) => {
    const { storeId, supabase } = ctx

    const storeHours = input.week_days.map((hour) => ({
      ...hour,
      store_id: storeId,
    }))

    const { data: createdHours, error: createHoursError } = await supabase
      .from('store_hours')
      .insert(storeHours)

    return { createdHours, createHoursError }
  })
