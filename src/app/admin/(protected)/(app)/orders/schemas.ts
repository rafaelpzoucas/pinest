import { z } from 'zod'

export const orderItemsSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      product_id: z.string().nullable(),
      quantity: z.number(),
      product_price: z.number(),
      observations: z.array(z.string()).optional().default([]),
      extras: z.array(
        z.object({
          name: z.string(),
          price: z.number(),
          extra_id: z.string(),
          quantity: z.number(),
        }),
      ),
    }),
  )
  .min(1, 'O pedido precisa de pelo menos 1 item.')
