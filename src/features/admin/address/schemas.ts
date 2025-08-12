import { z } from 'zod'

// Schema base para endereço (dados da tabela completa)
export const addressSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  state: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  complement: z.string().nullable().optional(),
  user_id: z.string().uuid().nullable().optional(),
  store_id: z.string().uuid().nullable().optional(),
})

// Schema para criação de endereço (sem campos auto-gerados)
export const createAddressSchema = z.object({
  zip_code: z
    .string()
    .min(8, 'CEP deve ter 8 dígitos')
    .max(9, 'CEP deve ter no máximo 9 caracteres') // Permite formato 00000-000
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000'),
  street: z.string().min(1, 'Rua é obrigatória').max(255, 'Rua muito longa'),
  number: z
    .string()
    .min(1, 'Número é obrigatório')
    .max(20, 'Número muito longo'),
  neighborhood: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro muito longo'),
  state: z
    .string()
    .min(2, 'Estado deve ter 2 caracteres')
    .max(2, 'Estado deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser a sigla em maiúsculas (ex: SP, RJ)'),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade muito longa'),
  complement: z
    .string()
    .max(255, 'Complemento muito longo')
    .optional()
    .or(z.literal('')),
  user_id: z.string().uuid().optional(),
  store_id: z.string().uuid().optional(),
})

// Schema para atualização de endereço (todos os campos opcionais exceto validações)
export const updateAddressSchema = createAddressSchema.partial()

// Schema para endereço de usuário (obrigatório user_id)
export const userAddressSchema = createAddressSchema
  .extend({
    user_id: z.string().uuid('ID do usuário inválido'),
  })
  .omit({ store_id: true })

// Schema para endereço de loja (obrigatório store_id)
export const storeAddressSchema = createAddressSchema
  .extend({
    store_id: z.string().uuid('ID da loja inválido'),
  })
  .omit({ user_id: true })

// Schema para busca de endereço por CEP (útil para APIs de CEP)
export const zipCodeSearchSchema = z.object({
  zip_code: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000')
    .transform((val) => val.replace('-', '')), // Remove hífen para padronizar
})

// Schema de resposta de API de CEP (ViaCEP, etc.)
export const cepApiResponseSchema = z.object({
  cep: z.string(),
  logradouro: z.string(),
  complemento: z.string().optional(),
  bairro: z.string(),
  localidade: z.string(), // cidade
  uf: z.string(), // estado
  ibge: z.string().optional(),
  gia: z.string().optional(),
  ddd: z.string().optional(),
  siafi: z.string().optional(),
  erro: z.boolean().optional(),
})

// Types TypeScript derivados dos schemas
export type Address = z.infer<typeof addressSchema>
export type CreateAddressInput = z.infer<typeof createAddressSchema>
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>
export type UserAddressInput = z.infer<typeof userAddressSchema>
export type StoreAddressInput = z.infer<typeof storeAddressSchema>
export type ZipCodeSearch = z.infer<typeof zipCodeSearchSchema>
export type CepApiResponse = z.infer<typeof cepApiResponseSchema>

// Esquema para validação de formulário com mensagens personalizadas
export const addressFormSchema = z.object({
  zip_code: z
    .string({ required_error: 'CEP é obrigatório' })
    .min(8, 'CEP deve ter 8 dígitos')
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z
    .string({ required_error: 'Rua é obrigatória' })
    .min(1, 'Rua é obrigatória'),
  number: z
    .string({ required_error: 'Número é obrigatório' })
    .min(1, 'Número é obrigatório'),
  neighborhood: z
    .string({ required_error: 'Bairro é obrigatório' })
    .min(1, 'Bairro é obrigatório'),
  state: z
    .string({ required_error: 'Estado é obrigatório' })
    .length(2, 'Estado deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'Use a sigla do estado (ex: SP)'),
  city: z
    .string({ required_error: 'Cidade é obrigatória' })
    .min(1, 'Cidade é obrigatória'),
  complement: z.string().optional(),
})

export const readViaCepAddressSchema = z.object({ zipCode: z.string() })

export type AddressFormInput = z.infer<typeof addressFormSchema>
export type ReadViaCepAddress = z.infer<typeof readViaCepAddressSchema>

// Utilitários para transformação de dados
export const formatZipCode = (zipCode: string): string => {
  const cleaned = zipCode.replace(/\D/g, '')
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export const cleanZipCode = (zipCode: string): string => {
  return zipCode.replace(/\D/g, '')
}
