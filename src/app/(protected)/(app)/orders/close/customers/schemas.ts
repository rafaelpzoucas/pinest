import { z } from 'zod'

export const createCustomerFormSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
})
