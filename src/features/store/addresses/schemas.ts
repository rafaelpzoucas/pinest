import { z } from 'zod'

export const ReadStoreAddressSchema = z.object({
  subdomain: z.string(),
})

export type ReadStoreAddress = z.infer<typeof ReadStoreAddressSchema>
