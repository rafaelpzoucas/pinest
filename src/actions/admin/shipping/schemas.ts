import { z } from 'zod'

export const readAdminShippingSchema = z.object({
  storeId: z.string(),
})
