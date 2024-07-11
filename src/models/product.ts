import { AttributeOptionsType } from './attribute'

export type ProductVariationAttributesType = {
  id: string
  created_at: string
  attribute_option_id: string
  product_variation_id: string
  attribute_options: AttributeOptionsType
}

export type ProductVariationsType = {
  id: string
  price: string | null
  stock: string | null
  created_at: string
  product_id: string
  product_variation_attributes: ProductVariationAttributesType[]
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
  price: number
  promotional_price: number
  stock: number
  thumb_url: string | null
  created_at: string
  category_id: string
  amount_sold: number
  sku: string
  pkg_weight: number
  pkg_length: number
  pkg_width: number
  pkg_height: number
  product_images: ProductImageType[]
  product_variations: ProductVariationsType[]
}
