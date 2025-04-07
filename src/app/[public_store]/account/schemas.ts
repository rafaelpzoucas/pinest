import { z } from 'zod'

export const readAccountSchema = z.object({
  phone: z.string().min(13, 'Telefone é obrigatório'),
})
