import { z } from 'zod'

export const ValidateCouponSchema = z.object({
  storeSlug: z.string(),
  code: z.string().max(20),
  customer_id: z.string().optional(),
})

export type ValidateCoupon = z.infer<typeof ValidateCouponSchema>
