import { z } from 'zod'
import { ProductImageSchema } from '../products/schemas'

export const StoreEdgeConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  logo_url: z.string(),
  theme: z.object({
    mode: z.string(),
    color: z.string(),
  }),
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  stock: z.number().nullable(),
  category_id: z.string().uuid(),
  promotional_price: z.number().nullable(),
  amount_sold: z.number(),
  store_id: z.string().uuid().nullable(),
  sku: z.string().nullable(),
  pkg_weight: z.number().nullable(),
  pkg_length: z.number().nullable(),
  pkg_width: z.number().nullable(),
  pkg_height: z.number().nullable(),
  product_url: z.string().nullable(),
  allows_extras: z.boolean().nullable(),
  need_choices: z.boolean().nullable(),
  status: z.string(),
  product_images: z.array(ProductImageSchema),
})

export const CategorySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  store_id: z.string().uuid().nullable(),
  products: z.array(ProductSchema),
  status: z.enum(['active', 'inactive']),
})

export const storeHoursSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(), // ou z.date() se já converter no fetch
  store_id: z.string().uuid().nullable(),
  day_of_week: z.string().nullable(), // ex: "monday", "tuesday", etc.
  is_open: z.boolean().nullable(),
  open_time: z.string().nullable(), // formato "HH:mm:ss"
  close_time: z.string().nullable(), // formato "HH:mm:ss"
})

export const shippingSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(), // ou z.date() se já vier como objeto Date
  price: z.number().nullable(),
  delivery_time: z.number().nullable(),
  store_id: z.string().uuid().nullable(),
  status: z.boolean(),
  pickup: z.boolean(),
  pickup_time: z.number().nullable(),
  carrier_id: z.string().uuid().nullable(),
  carrier_token: z.string().nullable(),
  motoboy: z.boolean().nullable(),
})

export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  logo_url: z.string().nullable(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  store_subdomain: z.string().nullable(),
  market_niche_id: z.string().uuid().nullable(),
  theme_color: z.string().nullable(),
  theme_mode: z.string().nullable(),
  is_open: z.boolean().nullable(),
  is_open_override: z.boolean().nullable(),
  ai_agent_prompt: z.string().nullable(),
  cnpj: z.string().nullable(),
  pix_key: z.string().nullable(),
  custom_domain: z.string().nullable(),
  store_hours: z.array(storeHoursSchema),
  shippings: z.array(shippingSchema).nullable(),
})

export const StoreShowcaseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  order_by: z.string().nullable(),
  status: z.boolean().nullable(),
  store_id: z.string().uuid().nullable(),
  position: z.number().nullable(),
  products: z.array(ProductSchema),
})

export const StoreDataSchema = StoreSchema.merge(
  z.object({
    categories: z.array(CategorySchema),
  }),
)

export const ProductsWithPaginationSchema = z.object({
  products: z.array(
    ProductSchema.extend({
      category_name: z.string().nullable(),
    }),
  ),
  total_count: z.number(),
  has_more: z.boolean(),
})

export type ProductImage = z.infer<typeof ProductImageSchema>
export type Product = z.infer<typeof ProductSchema>
export type Category = z.infer<typeof CategorySchema>
export type StoreHour = z.infer<typeof storeHoursSchema>
export type Store = z.infer<typeof StoreSchema>
export type StoreShowcase = z.infer<typeof StoreShowcaseSchema>
export type StoreData = z.infer<typeof StoreDataSchema>
export type StoreEdgeConfig = z.infer<typeof StoreEdgeConfigSchema>
export type ProductsWithPagination = z.infer<
  typeof ProductsWithPaginationSchema
>
