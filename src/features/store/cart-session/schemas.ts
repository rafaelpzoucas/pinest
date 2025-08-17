import { productSchema } from '@/features/store/products/schemas'
import { z } from 'zod'
import { extraSchema, selectedExtraSchema } from '../extras/schemas'

// Schema para variações de produto (JSONB)
export const ProductVariationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  value: z.string(),
  price_modifier: z.number().optional(),
  type: z.enum(['color', 'size', 'flavor', 'material', 'other']).optional(),
})

export const CartItemSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().nullable(),
  products: productSchema,
  quantity: z.number(),
  product_price: z.number(),
  observations: z.array(z.string()),
  extras: z.array(selectedExtraSchema),
})

export const UpdateCartItemSchema = CartItemSchema.omit({ products: true })

export const RemoveCartItemSchema = z.object({ cartItemId: z.string() })

// Schema principal para cart_sessions
export const CartSessionSchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
  product_id: z.string().uuid().nullable(),
  quantity: z.number().positive(),
  created_at: z.date(),
  product_variations: z.array(ProductVariationSchema).nullable().default([]),
  product_price: z.number().nullable(),
  observations: z.array(z.string()).nullable().default([]),
  extras: z.array(extraSchema).default([]),
  chat_id: z.string().nullable(),
})

// Schema para criação (sem campos auto-gerados)
export const CreateCartSessionSchema = CartSessionSchema.omit({
  id: true,
  created_at: true,
}).extend({
  session_id: z.string().uuid().optional(),
  quantity: z
    .number()
    .positive()
    .or(z.string().pipe(z.coerce.number().positive())),
  product_price: z
    .number()
    .nullable()
    .or(z.string().pipe(z.coerce.number()))
    .nullable(),
})

export const CreateCartProductSchema = z.object({
  newItem: CartItemSchema,
  session_id: z.string().uuid().optional(),
})

// Schema para atualização (todos os campos opcionais exceto id)
export const UpdateCartSessionSchema = CreateCartSessionSchema.partial()

// Schema para query/filtros
export const CartSessionQuerySchema = z.object({
  session_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  chat_id: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

// Schema para resposta da API
export const CartSessionResponseSchema = CartSessionSchema.extend({
  // Campos adicionais que podem vir de joins
  product: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      base_price: z.number(),
      image_url: z.string().url().nullable(),
    })
    .optional(),
})

// Schema para cálculo de totais
export const CartTotalSchema = z.object({
  subtotal: z.number(),
  total_variations: z.number(),
  total_extras: z.number(),
  total: z.number(),
  items_count: z.number().int(),
})

// Schema para agrupamento por sessão
export const CartSessionGroupSchema = z.object({
  session_id: z.string().uuid(),
  items: z.array(CartSessionResponseSchema),
  totals: CartTotalSchema,
  created_at: z.date(),
  updated_at: z.date(),
})

export const AddToCartSchema = z.object({
  subdomain: z.string(),
  newItem: CartItemSchema,
})

// Types exportados
export type CartSession = z.infer<typeof CartSessionSchema>
export type CartItem = z.infer<typeof CartItemSchema>
export type UpdateCartItem = z.infer<typeof UpdateCartItemSchema>
export type RemoveCartItem = z.infer<typeof RemoveCartItemSchema>
export type CreateCartSession = z.infer<typeof CreateCartSessionSchema>
export type UpdateCartSession = z.infer<typeof UpdateCartSessionSchema>
export type CartSessionQuery = z.infer<typeof CartSessionQuerySchema>
export type CartSessionResponse = z.infer<typeof CartSessionResponseSchema>
export type CartTotal = z.infer<typeof CartTotalSchema>
export type CartSessionGroup = z.infer<typeof CartSessionGroupSchema>
export type ProductVariation = z.infer<typeof ProductVariationSchema>
export type ProductExtra = z.infer<typeof extraSchema>
export type AddToCart = z.infer<typeof AddToCartSchema>

// Validadores utilitários
export const validateCartSession = (data: unknown) =>
  CartSessionSchema.parse(data)
export const validateCreateCartSession = (data: unknown) =>
  CreateCartSessionSchema.parse(data)
export const validateUpdateCartSession = (data: unknown) =>
  UpdateCartSessionSchema.parse(data)
export const validateCartSessionQuery = (data: unknown) =>
  CartSessionQuerySchema.parse(data)
