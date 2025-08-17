import { z } from 'zod'

export const selectedExtraSchema = z.object({
  extra_id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
})

// Schema base para extras
export const extraSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  name: z.string().nullable(),
  price: z.number().nullable(),
  store_id: z.string().uuid().nullable(),
  is_global: z.boolean().nullable().default(true),
})

// Schema para inserção (sem campos auto-gerados)
export const insertExtraSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  store_id: z.string().uuid().optional(),
  is_global: z.boolean().optional().default(true),
})

// Schema para atualização (campos opcionais)
export const updateExtraSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  price: z.number().positive('Preço deve ser positivo').optional(),
  store_id: z.string().uuid().optional(),
  is_global: z.boolean().optional(),
})

// Schema para filtros/query params
export const extraFiltersSchema = z.object({
  name: z.string().optional(),
  store_id: z.string().uuid().optional(),
  is_global: z.boolean().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
})

// Schema para paginação
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sort_by: z.enum(['name', 'price', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Schema combinado para listagem com filtros e paginação
export const getExtrasSchema = extraFiltersSchema.merge(paginationSchema)

// Tipos TypeScript derivados dos schemas
export type Extra = z.infer<typeof extraSchema>
export type SelectedExtra = z.infer<typeof selectedExtraSchema>
export type InsertExtra = z.infer<typeof insertExtraSchema>
export type UpdateExtra = z.infer<typeof updateExtraSchema>
export type ExtraFilters = z.infer<typeof extraFiltersSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type GetExtrasParams = z.infer<typeof getExtrasSchema>

// Schema para resposta da API com paginação
export const extrasPaginatedResponseSchema = z.object({
  data: z.array(extraSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    total_pages: z.number(),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
})

export type ExtrasPaginatedResponse = z.infer<
  typeof extrasPaginatedResponseSchema
>
