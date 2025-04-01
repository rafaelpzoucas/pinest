import { z } from 'zod'

export const createTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: 'Insira o número da mesa.' }),
  description: z.string().optional(),
  purchase_items: z
    .array(
      z.object({
        product_id: z.string(),
        quantity: z.number(),
        product_price: z.number(),
        observations: z.string(),
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
    .min(1, 'O pedido precisa de pelo menos 1 item.'),
})
