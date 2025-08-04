import { z } from 'zod'

export const readStoreProductsSchema = z.object({
  storeId: z.string(),
})
