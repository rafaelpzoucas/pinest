import { z } from "zod";

export const CustomerAddressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  complement: z.string().optional(),
  observations: z.string().optional(),
});

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  address: CustomerAddressSchema,
  created_at: z.string(),
});

export const StoreCustomerSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  customer_id: z.string(),
  store_id: z.string(),
  notes: z.string().nullable(),
  balance: z.number().nullable(),
  purchases_quantity: z.number(),
  customer: CustomerSchema,
});

export const ReadCustomerSchema = z.object({
  subdomain: z.string().optional(),
  phone: z.string().optional(),
});

export const CreateCustomerSchema = z.object({
  subdomain: z.string().optional(),
  customerId: z.string().uuid().optional(),
  phone: z.string().optional(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  address: CustomerAddressSchema,
});

export const UpdateCustomerSchema = z.object({
  subdomain: z.string().optional(),
  id: z.string({ message: "O ID do cliente é obrigatório." }),
  phone: z.string().optional(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  address: CustomerAddressSchema,
});

export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type StoreCustomer = z.infer<typeof StoreCustomerSchema>;
export type ReadCustomer = z.infer<typeof ReadCustomerSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;
