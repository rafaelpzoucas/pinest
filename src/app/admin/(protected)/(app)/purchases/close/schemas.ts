import { z } from 'zod'

export const closeBillFormSchema = z.object({
  amount: z.string({ message: 'Insira o valor a ser pago.' }),
  payment_type: z.enum(['cash', 'pix', 'credit-card', 'debit-card']),
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
  purchase_id: z.string().optional(),
})
