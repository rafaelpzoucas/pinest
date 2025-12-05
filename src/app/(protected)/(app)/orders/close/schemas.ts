import { z } from 'zod'

export const createPaymentSchema = z.object({
  customer_id: z.string().optional(),
  amount: z.string({ message: 'Insira o valor a ser pago.' }),
  payment_type: z.enum(['CASH', 'PIX', 'CREDIT', 'DEBIT', 'DEFERRED']),
  status: z.string(),
  discount: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
      }),
    )
    .optional(),
  table_id: z.string().optional(),
  order_id: z.string().optional(),
})

export const closeSaleSchema = z.object({
  table_id: z.string().optional(),
  order_id: z.string().optional(),
})
