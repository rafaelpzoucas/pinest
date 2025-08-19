import { z } from 'zod'

export const readCustomerOrdersSchema = z.object({
  storeCustomerId: z.string().optional(),
  storeId: z.string().optional(),
})

export type ReadCustomerOrders = z.infer<typeof readCustomerOrdersSchema>
