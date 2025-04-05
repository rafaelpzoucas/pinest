import { z } from 'zod'

export const createPurchaseSchema = z.object({
  totalAmount: z.number(),
  shippingPrice: z.number(),
  shippingTime: z.number(),
  type: z.string(),
  payment_type: z.string(),
  changeValue: z.number().optional(),
})
