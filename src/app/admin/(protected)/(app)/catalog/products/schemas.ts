import { z } from 'zod'

export const updateProductStatusSchema = z.object({
  product_id: z.string(),
  status: z.boolean(),
})
