import { z } from 'zod'

export const readAdminExtrasSchema = z.object({
  storeId: z.string(),
})
