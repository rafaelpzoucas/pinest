import { z } from 'zod'

// Schema base da store (todos os campos da tabela)
export const adminStoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  logo_url: z.string().url().nullable(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  store_subdomain: z.string().nullable(),
  market_niche_id: z.string().uuid().nullable(),
  theme_color: z.string().nullable(),
  theme_mode: z.enum(['light', 'dark', 'auto']).nullable(),
  is_open: z.boolean().nullable().default(false),
  is_open_override: z.boolean().nullable(),
  ai_agent_prompt: z.string().nullable(),
  cnpj: z.string().nullable(),
  pix_key: z.string().nullable(),
  custom_domain: z.string().nullable(),
})

// Schema para criação de store (campos obrigatórios na criação)
export const createAdminStoreSchema = z.object({
  name: z.string().min(1, 'Nome da loja é obrigatório').max(255).optional(),
  user_id: z.string().uuid().optional(),
  logo_url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  phone: z
    .string()
    .regex(/^[\d\s()+\-.]+$/, 'Formato de telefone inválido')
    .optional(),
  store_subdomain: z
    .string()
    .min(3, 'Subdomínio deve ter pelo menos 3 caracteres')
    .max(63)
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomínio deve conter apenas letras minúsculas, números e hífens',
    )
    .optional(),
  market_niche_id: z.string().uuid().optional(),
  theme_color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Formato de cor hexadecimal inválido',
    )
    .optional(),
  theme_mode: z.enum(['light', 'dark', 'auto']).optional(),
  is_open: z.boolean().default(false).optional(),
  is_open_override: z.boolean().optional(),
  ai_agent_prompt: z.string().max(2000).optional(),
  cnpj: z.string().optional(),
  pix_key: z.string().max(255).optional(),
  custom_domain: z
    .string()
    .regex(
      /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/,
      'Formato de domínio inválido',
    )
    .optional(),
})

// Schema para atualização de store (todos os campos opcionais)
export const updateAdminStoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  logo_url: z.string().url().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  phone: z
    .string()
    .regex(/^[\d\s()+\-.]+$/, 'Formato de telefone inválido')
    .nullable()
    .optional(),
  store_subdomain: z
    .string()
    .min(3, 'Subdomínio deve ter pelo menos 3 caracteres')
    .max(63)
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomínio deve conter apenas letras minúsculas, números e hífens',
    )
    .nullable()
    .optional(),
  market_niche_id: z.string().uuid().nullable().optional(),
  theme_color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Formato de cor hexadecimal inválido',
    )
    .nullable()
    .optional(),
  theme_mode: z.enum(['light', 'dark', 'auto']).nullable().optional(),
  is_open: z.boolean().nullable().optional(),
  is_open_override: z.boolean().nullable().optional(),
  ai_agent_prompt: z.string().max(2000).nullable().optional(),
  cnpj: z.string().nullable().optional(),
  pix_key: z.string().max(255).nullable().optional(),
  custom_domain: z
    .string()
    .regex(
      /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/,
      'Formato de domínio inválido',
    )
    .nullable()
    .optional(),
})

// Schema para queries/filtros
export const adminStoreQuerySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string().optional(),
  store_subdomain: z.string().optional(),
  custom_domain: z.string().optional(),
  market_niche_id: z.string().uuid().optional(),
  is_open: z.boolean().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).default(10),
  offset: z.number().int().nonnegative().default(0),
  order_by: z.enum(['created_at', 'name', 'updated_at']).default('created_at'),
  order_direction: z.enum(['asc', 'desc']).default('desc'),
})

// Schema para configurações da loja (campos específicos de configuração)
export const storeSettingsSchema = z.object({
  theme_color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Formato de cor hexadecimal inválido',
    )
    .optional(),
  theme_mode: z.enum(['light', 'dark', 'auto']).optional(),
  is_open: z.boolean().optional(),
  is_open_override: z.boolean().optional(),
  ai_agent_prompt: z.string().max(2000).optional(),
})

// Schema para informações de pagamento da loja
export const storePaymentInfoSchema = z.object({
  cnpj: z.string().optional(),
  pix_key: z.string().max(255).optional(),
})

// Types TypeScript derivados dos schemas
export type AdminStore = z.infer<typeof adminStoreSchema>
export type CreateAdminStore = z.infer<typeof createAdminStoreSchema>
export type UpdateAdminStore = z.infer<typeof updateAdminStoreSchema>
export type AdminStoreQuery = z.infer<typeof adminStoreQuerySchema>
export type StoreSettings = z.infer<typeof storeSettingsSchema>
export type StorePaymentInfo = z.infer<typeof storePaymentInfoSchema>

// Schema para validação de subdomínio único
export const validateSubdomainSchema = z.object({
  subdomain: z
    .string()
    .min(3, 'Subdomínio deve ter pelo menos 3 caracteres')
    .max(63)
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomínio deve conter apenas letras minúsculas, números e hífens',
    )
    .refine(
      (val) => !val.startsWith('-') && !val.endsWith('-'),
      'Subdomínio não pode começar ou terminar com hífen',
    ),
  exclude_store_id: z.string().uuid().optional(), // Para excluir a própria store na validação de unicidade
})

// Schema para validação de domínio customizado único
export const validateCustomDomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/,
      'Formato de domínio inválido',
    ),
  exclude_store_id: z.string().uuid().optional(),
})

export type ValidateSubdomain = z.infer<typeof validateSubdomainSchema>
export type ValidateCustomDomain = z.infer<typeof validateCustomDomainSchema>
