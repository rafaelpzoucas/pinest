import { z } from 'zod'

export const createPurchaseSchema = z.object({
  totalAmount: z.number(),
  discount: z.number(),
  shippingPrice: z.number(),
  shippingTime: z.number(),
  type: z.string(),
  payment_type: z.string(),
  changeValue: z.number().optional(),
  coupon_code: z.string().optional(),
  coupon_id: z.string().optional(),
  discount_value: z.number().optional(),
  discount_type: z.enum(['percent', 'fixed']).optional(),
})
