import { addressSchema } from '@/app/[public_store]/account/register/schemas'
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
  type: z.enum(['DELIVERY', 'TAKEOUT'], {
    message: 'Escolha o tipo do pedido.',
  }),
  payment_type: z.enum(['CREDIT', 'DEBIT', 'PIX', 'CASH'], {
    message: 'Escolha a forma de pagamento.',
  }),
  status: z.enum([
    'accept',
    'pending',
    'preparing',
    'readyToPickup',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  observations: z.string().optional(),
  total: z.object({
    subtotal: z.number(),
    shipping_price: z.number(),
    discount: z.string(),
    change_value: z.string(),
    total_amount: z.number(),
  }),
  delivery: z.object({
    time: z.string().optional(),
    address: addressSchema,
  }),
})
