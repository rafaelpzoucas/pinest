import { z } from 'zod'

export const hoursFormSchema = z.object({
  week_days: z.array(
    z.object({
      id: z.string().optional(),
      created_at: z.string().optional(),
      store_id: z.string().optional(),
      day_of_week: z.string(),
      is_open: z.boolean(),
      open_time: z.string().optional(),
      close_time: z.string().optional(),
    }),
  ),
})
