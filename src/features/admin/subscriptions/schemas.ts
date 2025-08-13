import { z } from 'zod'

// Base schema - campos obrigatórios da tabela
export const adminSubscriptionSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(), // timestamp with time zone
  store_id: z.string().uuid().nullable(),
  subscription_id: z.string().nullable(),
  plan_id: z.string().uuid().nullable(),
  status: z.string().nullable(),
  start_date: z.string().datetime(), // timestamp with time zone
  end_date: z.string().datetime().nullable(),
})

// Para inserção (campos opcionais que têm default no DB)
export const createAdminSubscriptionSchema = z.object({
  store_id: z.string().uuid().nullable().optional(),
  subscription_id: z.string().nullable().optional(),
  plan_id: z.string().uuid().nullable().optional(),
  status: z.string().nullable().optional(),
  end_date: z.number().nullable().optional(),
  // id, created_at, start_date têm defaults no DB
})

// Para inserção com campos obrigatórios (caso você queira forçar alguns)
export const createAdminSubscriptionWithRequiredSchema = z.object({
  store_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  status: z.enum(['active', 'inactive', 'pending', 'cancelled', 'expired']),
  subscription_id: z.string().nullable().optional(),
  end_date: z.string().datetime().nullable().optional(),
})

// Para atualização (todos campos opcionais exceto ID)
export const updateAdminSubscriptionSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid().nullable().optional(),
  subscription_id: z.string().nullable().optional(),
  plan_id: z.string().uuid().nullable().optional(),
  status: z.string().nullable().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().nullable().optional(),
})

// Para queries/filtros
export const adminSubscriptionFiltersSchema = z.object({
  store_id: z.string().uuid().optional(),
  plan_id: z.string().uuid().optional(),
  status: z.string().optional(),
  active_only: z.boolean().optional(), // Para filtrar apenas ativas
})

// Schema para status mais específico (se você quiser tipar melhor)
export const subscriptionStatusSchema = z.enum([
  'active',
  'inactive',
  'pending',
  'cancelled',
  'expired',
  'trial',
  'past_due',
])

// Schema com status tipado
export const adminSubscriptionWithTypedStatusSchema =
  adminSubscriptionSchema.extend({
    status: subscriptionStatusSchema.nullable(),
  })

// Para criar com status tipado
export const createAdminSubscriptionWithTypedStatusSchema =
  createAdminSubscriptionWithRequiredSchema.extend({
    status: subscriptionStatusSchema,
  })

// Types TypeScript inferidos
export type AdminSubscription = z.infer<typeof adminSubscriptionSchema>
export type CreateAdminSubscription = z.infer<
  typeof createAdminSubscriptionSchema
>
export type CreateAdminSubscriptionWithRequired = z.infer<
  typeof createAdminSubscriptionWithRequiredSchema
>
export type UpdateAdminSubscription = z.infer<
  typeof updateAdminSubscriptionSchema
>
export type AdminSubscriptionFilters = z.infer<
  typeof adminSubscriptionFiltersSchema
>
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>
export type AdminSubscriptionWithTypedStatus = z.infer<
  typeof adminSubscriptionWithTypedStatusSchema
>

// Schemas para inputs de server actions
export const readAdminSubscriptionInputSchema = z.object({
  id: z.string().uuid(),
})

export const readAdminSubscriptionsByStoreInputSchema = z.object({
  store_id: z.string().uuid(),
  filters: adminSubscriptionFiltersSchema.optional(),
})

export const deleteAdminSubscriptionInputSchema = z.object({
  subscription_id: z.string(),
  store_id: z.string(),
})

// Schema para verificar se subscription está ativa
export const checkActiveSubscriptionInputSchema = z.object({
  store_id: z.string().uuid(),
})

// Schema para response de verificação de subscription ativa
export const activeSubscriptionResponseSchema = z.object({
  hasActiveSubscription: z.boolean(),
  subscription: adminSubscriptionSchema.nullable(),
  daysUntilExpiry: z.number().nullable(),
})
