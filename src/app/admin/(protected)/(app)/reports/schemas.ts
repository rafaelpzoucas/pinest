import { z } from 'zod'

export const paymentTypesSchema = z.object({
  pix: z.string(),
  cash: z.string(),
  card: z.string(),
})

export const getSalesReportInputSchema = z.object({
  start_date: z.string(),
  end_date: z.string().optional(),
})

export const getSalesReportOutputSchema = z.object({
  paymentTypes: paymentTypesSchema,
})
