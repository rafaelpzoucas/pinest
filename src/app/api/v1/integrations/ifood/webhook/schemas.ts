import { z } from 'zod'

export const createIfoodPurchaseSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  status: z.string(),
  total_amount: z.number(),
  shipping_price: z.number(),
  type: z.string(),
  accepted: z.boolean(),
  change_value: z.number(),
  payment_type: z.string(),
  guest_data: z.any(),
  is_paid: z.boolean(),
  is_ifood: z.boolean(),
  ifood_order_data: z.any(),
})
