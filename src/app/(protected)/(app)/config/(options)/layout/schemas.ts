import { z } from 'zod'

export const appearenceFormSchema = z.object({
  theme_color: z.string().optional(),
  theme_mode: z.string().optional(),
})
