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
  product_images: ProductImageType[]
}
