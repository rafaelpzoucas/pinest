import { z } from 'zod'

// Base schema - campos obrigatórios da tabela
export const storeHoursSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(), // timestamp with time zone
  store_id: z.string().uuid().optional(),
  day_of_week: z.string().optional(),
  is_open: z.boolean().optional(),
  open_time: z.string().optional(), // time sem fuso
  close_time: z.string().optional(), // time sem fuso
})

// Para inserção (campos opcionais que têm default no DB)
export const createStoreHoursSchema = z.object({
  week_days: z.array(storeHoursSchema),
})

// Para atualização (todos campos opcionais exceto ID)
export const updateStoreHoursSchema = z.object({
  week_days: z.array(storeHoursSchema),
})

// Para queries/filtros
export const storeHoursFiltersSchema = z.object({
  store_id: z.string().uuid().optional(),
  day_of_week: z.string().optional(),
  is_open: z.boolean().optional(),
})

// Types TypeScript inferidos
export type StoreHours = z.infer<typeof storeHoursSchema>
export type CreateStoreHours = z.infer<typeof createStoreHoursSchema>

export type UpdateStoreHours = z.infer<typeof updateStoreHoursSchema>
export type StoreHoursFilters = z.infer<typeof storeHoursFiltersSchema>

// Schemas para inputs de server actions
export const readStoreHoursInputSchema = z.object({
  id: z.string().uuid(),
})

export const readStoreHoursByStoreInputSchema = z.object({
  store_id: z.string().uuid(),
  filters: storeHoursFiltersSchema.optional(),
})

export const deleteStoreHoursInputSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
})
