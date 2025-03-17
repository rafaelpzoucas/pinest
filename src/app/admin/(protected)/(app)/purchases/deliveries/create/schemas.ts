import { z } from 'zod'

export const createPurchaseFormSchema = z.object({
  customer_id: z.string().min(1, 'Selecione o cliente.'),
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
  type: z.enum(['delivery', 'pickup'], {
    message: 'Escolha o tipo do pedido.',
  }),
  payment_type: z.enum(['card', 'pix', 'cash'], {
    message: 'Escolha a forma de pagamento.',
  }),
  change_value: z.string().optional(),
  discount: z.string().optional(),
  status: z.enum(['pending', 'preparing', 'shipped', 'delivered', 'cancelled']),
  accepted: z.boolean(),
  total_amount: z.number(),
  shipping_price: z.number(),
})
