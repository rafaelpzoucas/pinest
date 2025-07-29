import { z } from 'zod'

export const addressSchema = z.object({
  street: z.string().min(1, { message: 'Preencha o nome da rua.' }),
  number: z.string().min(1, { message: 'Insira o número da residência.' }),
  neighborhood: z.string().optional(),
  complement: z.string().optional(),
  observations: z.string().optional(),
})

export const createCustomerSchema = z.object({
  phone: z.string().min(1, 'Telefone é obrigatório.'),
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  address: addressSchema,
})

export const updateCustomerSchema = z.object({
  id: z.string({ message: 'O ID do cliente é obrigatório.' }),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  address: addressSchema,
})
