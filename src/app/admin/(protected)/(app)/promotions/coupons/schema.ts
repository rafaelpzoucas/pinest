import { z } from 'zod'

export const couponSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Nome obrigatório'),
  code: z
    .string()
    .min(3, 'Código obrigatório')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Apenas letras maiúsculas e números'),
  discount: z.string({ message: 'Desconto obrigatório' }),
  discount_type: z.enum(['percent', 'fixed'], {
    required_error: 'Tipo de desconto obrigatório',
  }),
  status: z.enum(['active', 'disabled', 'expired'], {
    required_error: 'Status obrigatório',
  }),
  expires_at: z.string().date().optional(),
  usage_limit: z.string().optional(),
  usage_limit_per_customer: z.string().optional(),
})

export type CouponFormValues = z.infer<typeof couponSchema>
