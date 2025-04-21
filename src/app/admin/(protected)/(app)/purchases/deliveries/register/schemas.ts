import { addressSchema } from '@/app/[public_store]/account/register/schemas'
import { z } from 'zod'
import { purchaseItemsSchema } from '../../schemas'

export const purchaseTypeEnum = z.enum(['DELIVERY', 'TAKEOUT'], {
  message: 'Escolha o tipo do pedido.',
})

export const paymentTypeEnum = z.enum(['CREDIT', 'DEBIT', 'PIX', 'CASH'], {
  message: 'Escolha a forma de pagamento.',
})

const statusEnum = z.enum([
  'accept',
  'pending',
  'preparing',
  'readyToPickup',
  'shipped',
  'delivered',
  'cancelled',
])

const totalSchema = z.object({
  subtotal: z.number(),
  shipping_price: z.number(),
  discount: z.string().optional(),
  change_value: z.string().optional(),
  total_amount: z.number(),
})

const deliverySchema = z.object({
  time: z.string().optional(),
  address: addressSchema,
})

export const createPurchaseFormSchema = z.object({
  customer_id: z.string().min(1, 'Selecione o cliente.'),
  purchase_items: purchaseItemsSchema,
  type: purchaseTypeEnum,
  payment_type: paymentTypeEnum,
  status: statusEnum,
  observations: z.string().optional(),
  total: totalSchema,
  delivery: deliverySchema,
  is_ifood: z.boolean().optional(),
  ifood_order_data: z.any().optional(),
})

export const updatePurchaseFormSchema = z.object({
  id: z.string(),
  purchase_items: purchaseItemsSchema,
  type: purchaseTypeEnum,
  payment_type: paymentTypeEnum,
  observations: z.string().optional(),
  total: totalSchema,
  delivery: deliverySchema,
})
