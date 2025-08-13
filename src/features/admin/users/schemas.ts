import { z } from 'zod'

// Enum para roles de usuário
export const UserRoleEnum = z.enum(['customer', 'admin', 'manager', 'vendor'])

// Enum para status de assinatura
export const SubscriptionStatusEnum = z.enum([
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid',
])

// Schema base do AdminUser
export const AdminUserSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  name: z.string().nullable().optional(),
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .min(1, 'Email é obrigatório'),
  phone: z.string().nullable().optional(),
  cpf_cnpj: z.string().nullable().optional(),
  role: UserRoleEnum.default('customer'),
  stripe_account_id: z.string().nullable().optional(),
  stripe_connected_account: z.string().nullable().optional(),
  subscription_status: SubscriptionStatusEnum.nullable().optional(),
  subscription_expires_at: z.date().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

// Schema para criação de AdminUser (campos obrigatórios apenas)
export const CreateAdminUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .min(1, 'Email é obrigatório')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  phone: z.string().nullable().optional(),
  cpf_cnpj: z.string().nullable().optional(),
  role: UserRoleEnum.default('customer'),
  stripe_account_id: z.string().nullable().optional(),
  stripe_connected_account: z.string().nullable().optional(),
})

// Schema para atualização de AdminUser (todos os campos opcionais)
export const UpdateAdminUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .optional(),
  phone: z.string().nullable().optional(),
  cpf_cnpj: z.string().nullable().optional(),
  role: UserRoleEnum.optional(),
  stripe_account_id: z.string().nullable().optional(),
  stripe_connected_account: z.string().nullable().optional(),
  subscription_status: SubscriptionStatusEnum.nullable().optional(),
  subscription_expires_at: z.date().nullable().optional(),
})

// Schema para filtros de busca
export const AdminUserFiltersSchema = z.object({
  search: z.string().optional(),
  role: UserRoleEnum.optional(),
  subscription_status: SubscriptionStatusEnum.optional(),
  has_phone: z.boolean().optional(),
  has_cpf_cnpj: z.boolean().optional(),
  has_stripe_account: z.boolean().optional(),
  created_after: z.date().optional(),
  created_before: z.date().optional(),
  subscription_expires_after: z.date().optional(),
  subscription_expires_before: z.date().optional(),
})

// Schema para paginação
export const AdminUserPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort_by: z
    .enum([
      'name',
      'email',
      'created_at',
      'updated_at',
      'subscription_expires_at',
    ])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Schema combinado para listagem com filtros e paginação
export const ListAdminUsersSchema = AdminUserFiltersSchema.merge(
  AdminUserPaginationSchema,
)

// Schema para validação de ID
export const AdminUserIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// Schema para response de lista
export const AdminUserListResponseSchema = z.object({
  data: z.array(AdminUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
})

// Schema para operações em lote
export const BulkAdminUserOperationSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Pelo menos um ID deve ser fornecido'),
  operation: z.enum(['delete', 'update_role', 'activate', 'deactivate']),
  data: z.record(z.any()).optional(),
})

// Tipos TypeScript derivados dos schemas
export type AdminUser = z.infer<typeof AdminUserSchema>
export type CreateAdminUser = z.infer<typeof CreateAdminUserSchema>
export type UpdateAdminUser = z.infer<typeof UpdateAdminUserSchema>
export type AdminUserFilters = z.infer<typeof AdminUserFiltersSchema>
export type AdminUserPagination = z.infer<typeof AdminUserPaginationSchema>
export type ListAdminUsers = z.infer<typeof ListAdminUsersSchema>
export type AdminUserId = z.infer<typeof AdminUserIdSchema>
export type AdminUserListResponse = z.infer<typeof AdminUserListResponseSchema>
export type BulkAdminUserOperation = z.infer<
  typeof BulkAdminUserOperationSchema
>
export type UserRole = z.infer<typeof UserRoleEnum>
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>

// Utilitários de validação
export const validateAdminUser = (data: unknown) => {
  return AdminUserSchema.safeParse(data)
}

export const validateCreateAdminUser = (data: unknown) => {
  return CreateAdminUserSchema.safeParse(data)
}

export const validateUpdateAdminUser = (data: unknown) => {
  return UpdateAdminUserSchema.safeParse(data)
}

export const validateListAdminUsers = (data: unknown) => {
  return ListAdminUsersSchema.safeParse(data)
}

export const validateAdminUserId = (data: unknown) => {
  return AdminUserIdSchema.safeParse(data)
}

// Transformadores para diferentes formatos
export const transformAdminUserForAPI = (user: AdminUser) => {
  return {
    ...user,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    subscription_expires_at:
      user.subscription_expires_at?.toISOString() || null,
  }
}

export const transformAPIResponseToAdminUser = (data: any): AdminUser => {
  return AdminUserSchema.parse({
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    subscription_expires_at: data.subscription_expires_at
      ? new Date(data.subscription_expires_at)
      : null,
  })
}

// Schema para validação de formulários (com mensagens em português)
export const AdminUserFormSchema = CreateAdminUserSchema.extend({
  confirmEmail: z.string().email('Email deve ter um formato válido'),
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Os emails devem ser iguais',
  path: ['confirmEmail'],
})

export type AdminUserForm = z.infer<typeof AdminUserFormSchema>
