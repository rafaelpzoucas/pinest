import { addressSchema } from "@/features/admin/address/schemas";
import { z } from "zod";

// Schema base da tabela stores
export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).nullable(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  logo_url: z.string().url().nullable(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  store_subdomain: z.string().nullable(),
  market_niche_id: z.string().uuid().nullable(),
  theme_color: z.string().nullable(),
  theme_mode: z.string().nullable(),
  is_open: z.boolean(),
  is_open_override: z.boolean().nullable(),
  ai_agent_prompt: z.string().nullable(),
  cnpj: z.string().nullable(),
  pix_key: z.string().nullable(),
  custom_domain: z.string().nullable(),
  address: addressSchema,
});

export const ReadStoreCustomerSchema = z.object({
  storeId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

// Tipos inferidos
export type Store = z.infer<typeof StoreSchema>;
export type ReadStoreCustomer = z.infer<typeof ReadStoreCustomerSchema>;

// Schema para criação (sem campos automáticos/defaults)
export const CreateStoreSchema = StoreSchema.omit({
  id: true,
  created_at: true,
}).partial({
  logo_url: true,
  description: true,
  phone: true,
  store_subdomain: true,
  market_niche_id: true,
  theme_color: true,
  theme_mode: true,
  is_open: true,
  is_open_override: true,
  ai_agent_prompt: true,
  cnpj: true,
  pix_key: true,
  custom_domain: true,
});

// Schema para update (tudo opcional)
export const UpdateStoreSchema = CreateStoreSchema.partial();
