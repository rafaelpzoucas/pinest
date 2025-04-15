import { addressSchema } from '@/app/[public_store]/account/register/schemas'
import { z } from 'zod'
import { purchaseItemsSchema } from '../../schemas'

export const createPurchaseFormSchema = z.object({
  customer_id: z.string().min(1, 'Selecione o cliente.'),
  purchase_items: purchaseItemsSchema,
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
  is_ifood: z.boolean().optional(),
  ifood_order_data: z.any().optional(),
})
