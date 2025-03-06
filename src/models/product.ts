export type VariationOption = {
  id?: string
  name?: string
  price?: number
  stock?: number
}

export type ProductVariationType = {
  id: string
  name: string
  price: number
  stock: number
  attribute_id: string
  product_id: string
  created_at: string
  attributes: {
    id: string
    name: string
    created_at: string
  }
}

export type ProductImageType = {
  created_at: string
  id: string
  image_url: string
  product_id: string
}

export type ProductType = {
  id: string
  name: string
  description: string
  observations: string
  price: number
  promotional_price: number
  stock: number
  thumb_url: string | null
  created_at: string
  category_id: string
  amount_sold: number
  sku: string
  allows_extras: boolean
  pkg_weight: number
  pkg_length: number
  pkg_width: number
  pkg_height: number
  product_url: string
  product_images: ProductImageType[]
  product_variations: ProductVariationType[]
}
