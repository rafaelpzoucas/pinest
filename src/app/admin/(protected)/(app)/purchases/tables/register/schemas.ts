import { z } from 'zod'
import { purchaseItemsSchema } from '../../schemas'

export const createTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: 'Insira o número da mesa.' }),
  description: z.string().optional(),
  purchase_items: purchaseItemsSchema,
})

export const updateTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: 'Insira o número da mesa.' }),
  description: z.string().optional(),
  purchase_items: purchaseItemsSchema,
  is_edit: z.boolean(),
})
