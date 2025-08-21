import { addressSchema } from '@/app/old-store/account/register/schemas'
import { z } from 'zod'

export const createCustomerFormSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: addressSchema,
})
