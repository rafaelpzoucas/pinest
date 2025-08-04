import { z } from 'zod'

export const readAdminObservationsSchema = z.object({
  storeId: z.string(),
})

export const createAdminObservationSchema = z.object({
  observation: z.string(),
  storeId: z.string().uuid().optional(),
})

export type CreateAdminObservationType = z.infer<
  typeof createAdminObservationSchema
>
