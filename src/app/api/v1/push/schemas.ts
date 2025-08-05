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

export const notifySchema = z.object({
  storeId: z.string().optional(),
  customerPhone: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
})

export type NotifyType = z.infer<typeof notifySchema>
