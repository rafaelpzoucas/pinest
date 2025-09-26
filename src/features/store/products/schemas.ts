import { z } from 'zod'

// Schema para validação de entrada (sem campos auto-gerados)
export const insertProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Preço deve ser positivo').optional().nullable(),
  stock: z
    .number()
    .min(0, 'Estoque não pode ser negativo')
    .optional()
    .nullable(),
  category_id: z.string().uuid('ID da categoria deve ser um UUID válido'),
  promotional_price: z
    .number()
    .positive('Preço promocional deve ser positivo')
    .optional()
    .nullable(),
  amount_sold: z
    .number()
    .min(0, 'Quantidade vendida não pode ser negativa')
    .default(0),
  store_id: z
    .string()
    .uuid('ID da loja deve ser um UUID válido')
    .optional()
    .nullable(),
  sku: z.string().optional().nullable(),
  pkg_weight: z
    .number()
    .positive('Peso do pacote deve ser positivo')
    .optional()
    .nullable(),
  pkg_length: z
    .number()
    .positive('Comprimento do pacote deve ser positivo')
    .optional()
    .nullable(),
  pkg_width: z
    .number()
    .positive('Largura do pacote deve ser positiva')
    .optional()
    .nullable(),
  pkg_height: z
    .number()
    .positive('Altura do pacote deve ser positiva')
    .optional()
    .nullable(),
  product_url: z
    .string()
    .url('URL do produto deve ser válida')
    .optional()
    .nullable(),
  allows_extras: z.boolean().default(true).optional().nullable(),
  need_choices: z.boolean().optional().nullable(),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
})

export const ProductImageSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  product_id: z.string().uuid(),
  image_url: z.string().nullable(),
})

// Schema para validação de atualização (todos os campos opcionais exceto validações específicas)
export const updateProductSchema = insertProductSchema.partial().extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

// Schema completo do produto (incluindo campos auto-gerados)
export const productSchema = z.object({
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

// Schema para queries/filtros
export const productFiltersSchema = z.object({
  category_id: z.string().uuid().optional(),
  store_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  in_stock: z.boolean().optional(),
  search: z.string().optional(),
  has_promotion: z.boolean().optional(),
})

// Schema para ordenação
export const productSortSchema = z.object({
  field: z
    .enum(['name', 'price', 'created_at', 'amount_sold', 'stock'])
    .default('created_at'),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

// Tipos TypeScript inferidos
export type Product = z.infer<typeof productSchema>
export type InsertProduct = z.infer<typeof insertProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>
export type ProductFilters = z.infer<typeof productFiltersSchema>
export type ProductSort = z.infer<typeof productSortSchema>

// Schema para resposta paginada
export const paginatedProductsSchema = z.object({
  data: z.array(productSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type PaginatedProducts = z.infer<typeof paginatedProductsSchema>

// Validação customizada para preço promocional
export const productWithPromotionValidation = insertProductSchema.refine(
  (data) => {
    if (data.promotional_price && data.price) {
      return data.promotional_price < data.price
    }
    return true
  },
  {
    message: 'Preço promocional deve ser menor que o preço regular',
    path: ['promotional_price'],
  },
)
