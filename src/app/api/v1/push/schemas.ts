import { z } from 'zod'

export const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string(),
    keys: z.object({
      auth: z.string(),
      p256dh: z.string(),
    }),
  }),
  storeId: z.string().optional(),
  customerPhone: z.string().optional(),
})

export const notifyStoreSchema = z.object({
  description: z.string().optional(),
  storeId: z.string().optional(),
  title: z.string().optional(),
  customerPhone: z.string().optional(),
  url: z.string().optional(),
})

export type NotifyStoreType = z.infer<typeof notifyStoreSchema>
