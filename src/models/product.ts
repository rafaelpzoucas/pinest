export type VariationOption = {
  id?: string
  name?: string
  price?: number
  stock?: number
}

export type ProductVariationsType = {
  id?: string
  attribute: string
  product_variations?: VariationOption[]
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
  product_url: string
  product_images: ProductImageType[]
  product_variations: {
    id: string
    name: string
    price: number
    stock: number
    attributes: {
      id: string
      name: string
      created_at: string
    }
    created_at: string
    product_id: string
    attribute_id: string
  }[]
}
