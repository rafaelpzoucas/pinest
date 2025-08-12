import { z } from 'zod'

export const authCallbackInputSchema = z.object({
  code: z.string(),
  origin: z.string(),
})
