import { z } from 'zod'

export const CustomerAddressSchema = z.object({
  street: z.string().min(1, { message: 'Preencha o nome da rua.' }),
  number: z.string().min(1, { message: 'Insira o número da residência.' }),
  neighborhood: z.string().optional(),
  complement: z.string().optional(),
  observations: z.string().optional(),
})

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  address: CustomerAddressSchema,
  created_at: z.string(),
})

export const ReadCustomerSchema = z.object({
  subdomain: z.string().optional(),
  phone: z.string().optional(),
})

export const CreateCustomerSchema = z.object({
  subdomain: z.string(),
  phone: z.string().min(14, 'Insira um número de telefone válido.'),
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  address: CustomerAddressSchema,
})

export const UpdateCustomerSchema = z.object({
  subdomain: z.string(),
  id: z.string({ message: 'O ID do cliente é obrigatório.' }),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  address: CustomerAddressSchema,
})

export type CustomerAddress = z.infer<typeof CustomerAddressSchema>
export type Customer = z.infer<typeof CustomerSchema>
export type ReadCustomer = z.infer<typeof ReadCustomerSchema>
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>
