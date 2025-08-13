import { z } from 'zod'

// Schema para resposta da API ViaCEP
export const viacepResponseSchema = z.object({
  cep: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000'),
  logradouro: z.string(),
  complemento: z.string(),
  bairro: z.string(),
  localidade: z.string(), // cidade
  uf: z.string().length(2, 'UF deve ter 2 caracteres'), // estado
  ibge: z.string(),
  gia: z.string(),
  ddd: z.string(),
  siafi: z.string(),
})

// Schema para input de busca por CEP
export const readViaCepAddressSchema = z.object({
  zipCode: z
    .string()
    .min(8, 'CEP deve ter 8 dígitos')
    .max(9, 'CEP deve ter no máximo 9 caracteres')
    .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000 ou 00000000')
    .transform((val) => val.replace(/\D/g, '')), // Remove caracteres especiais
})

// Schema com validações mais rigorosas para uso em formulários
export const viacepFormattedSchema = z.object({
  cep: z
    .string()
    .regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000')
    .transform((val) => val.replace(/\D/g, '')), // Remove hífen para armazenar
  logradouro: z
    .string()
    .min(1, 'Logradouro é obrigatório')
    .max(255, 'Logradouro muito longo'),
  complemento: z.string().max(255, 'Complemento muito longo'),
  bairro: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .max(100, 'Bairro muito longo'),
  localidade: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Nome da cidade muito longo'),
  uf: z
    .string()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'UF deve conter apenas letras maiúsculas'),
  ibge: z.string().regex(/^\d{7}$/, 'Código IBGE deve ter 7 dígitos'),
  gia: z
    .string()
    .regex(/^\d{4}$/, 'Código GIA deve ter 4 dígitos')
    .optional()
    .or(z.literal('')), // GIA pode ser vazio
  ddd: z.string().regex(/^\d{2}$/, 'DDD deve ter 2 dígitos'),
  siafi: z
    .string()
    .regex(/^\d{4}$/, 'Código SIAFI deve ter 4 dígitos')
    .optional()
    .or(z.literal('')), // SIAFI pode ser vazio
})

// Schema para quando a API retorna erro (CEP não encontrado)
export const viacepErrorSchema = z.object({
  erro: z.boolean().refine((val) => val === true, 'Resposta de erro inválida'),
})

// Schema que aceita tanto sucesso quanto erro
export const viacepApiResponseSchema = z.union([
  viacepResponseSchema,
  viacepErrorSchema,
])

// Schema para converter ViaCEP para nosso formato de endereço interno
export const viacepToAddressSchema = viacepResponseSchema.transform((data) => ({
  zip_code: data.cep.replace(/\D/g, ''), // Remove hífen
  street: data.logradouro,
  complement: data.complemento || undefined,
  neighborhood: data.bairro,
  city: data.localidade,
  state: data.uf,
  // Campos adicionais que podem ser úteis
  ibge_code: data.ibge,
  area_code: data.ddd,
}))

// Types TypeScript derivados
export type ViacepResponse = z.infer<typeof viacepResponseSchema>
export type ViacepFormatted = z.infer<typeof viacepFormattedSchema>
export type ReadViaCepInput = z.infer<typeof readViaCepAddressSchema>
export type ViacepError = z.infer<typeof viacepErrorSchema>
export type ViacepApiResponse = z.infer<typeof viacepApiResponseSchema>
export type ViacepToAddress = z.infer<typeof viacepToAddressSchema>

// Função utilitária para validar se é um erro do ViaCEP
export const isViacepError = (data: unknown): data is ViacepError => {
  return viacepErrorSchema.safeParse(data).success
}

// Função utilitária para formatar CEP
export const formatCep = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
}

// Função utilitária para limpar CEP
export const cleanCep = (cep: string): string => {
  return cep.replace(/\D/g, '')
}
