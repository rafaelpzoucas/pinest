import { z } from 'zod'

export const ShippingsSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  price: z.number().nullable(),
  delivery_time: z.number().nullable(),
  store_id: z.string().uuid(),
  status: z.boolean(),
  pickup: z.boolean(),
  motoboy: z.boolean(),
  pickup_time: z.number(),
})

export const ReadStoreShippingsSchema = z.object({
  subdomain: z.string(),
})

export type Shippings = z.infer<typeof ShippingsSchema>
export type ReadStoreShippings = z.infer<typeof ReadStoreShippingsSchema>
