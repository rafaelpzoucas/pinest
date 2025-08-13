import { z } from 'zod'

// Base schema - campos obrigatórios da tabela
export const adminStoreSocialsSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(), // timestamp with time zone
  store_id: z.string().uuid().nullable(),
  link: z.string().nullable(),
  social_id: z.string().nullable(),
})

// Para inserção (campos opcionais que têm default no DB)
export const createAdminStoreSocialsSchema = z.object({
  socials: z.array(
    z.object({
      store_id: z.string().uuid().nullable().optional(),
      link: z.string().nullable().optional(),
      social_id: z.string().nullable().optional(),
      // id e created_at têm defaults no DB
    }),
  ),
})

// Para atualização (todos campos opcionais exceto ID)
export const updateAdminStoreSocialsSchema = z.object({
  socials: z.array(
    z.object({
      id: z.string().uuid().optional(),
      store_id: z.string().uuid().nullable().optional(),
      link: z.string().nullable().optional(),
      social_id: z.string().nullable().optional(),
      // id e created_at têm defaults no DB
    }),
  ),
})

export const deleteAdminStoreSocialSchema = z.object({
  id: z.string().uuid(),
})

// Para queries/filtros
export const adminStoreSocialsFiltersSchema = z.object({
  store_id: z.string().uuid().optional(),
  social_id: z.string().optional(),
})

// Types TypeScript inferidos
export type AdminStoreSocials = z.infer<typeof adminStoreSocialsSchema>
export type CreateAdminStoreSocials = z.infer<
  typeof createAdminStoreSocialsSchema
>

export type UpdateAdminStoreSocials = z.infer<
  typeof updateAdminStoreSocialsSchema
>
export type DeleteAdminStoreSocials = z.infer<
  typeof deleteAdminStoreSocialSchema
>
export type AdminStoreSocialsFilters = z.infer<
  typeof adminStoreSocialsFiltersSchema
>

// Schemas para inputs de server actions
export const readAdminStoreSocialsInputSchema = z.object({
  id: z.string().uuid(),
})

export const readAdminStoreSocialsByStoreInputSchema = z.object({
  store_id: z.string().uuid(),
  filters: adminStoreSocialsFiltersSchema.optional(),
})
