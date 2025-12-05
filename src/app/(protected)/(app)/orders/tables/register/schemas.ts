import { z } from 'zod'
import { orderItemsSchema } from '../../schemas'

export const createTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: 'Insira o número da mesa.' }),
  description: z.string().optional(),
  order_items: orderItemsSchema,
})

export const updateTableSchema = z.object({
  id: z.string().optional(),
  number: z.string({ message: 'Insira o número da mesa.' }),
  description: z.string().optional(),
  order_items: orderItemsSchema,
  is_edit: z.boolean(),
})
