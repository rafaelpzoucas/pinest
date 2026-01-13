import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  complement: z.string().optional(),
  observations: z.string().optional(),
});

export const createAdminCustomerSchema = z.object({
  storeId: z.string().uuid(),
  phone: z.string().optional(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  address: addressSchema,
});

export const updateAdminCustomerSchema = z.object({
  id: z.string({ message: "O ID do cliente é obrigatório." }),
  phone: z.string().min(1, "Telefone é obrigatório."),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  address: addressSchema,
});

export const readAdminCustomersSchema = z.object({ storeId: z.string() });

export type CreateAdminCustomerType = z.infer<typeof createAdminCustomerSchema>;
