import { z } from 'zod'

export const readStoreCategoriesSchema = z.object({
  storeId: z.string(),
})
