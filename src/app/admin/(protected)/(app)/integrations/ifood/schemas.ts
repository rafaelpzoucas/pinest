import { z } from 'zod'

export const InsertMerchantIdFormSchema = z.object({
  merchant_id: z.string().min(1, { message: 'O merchantId é obrigatório' }),
})
