import { ProductType } from './product'

export type CategoryType = {
  id: string
  created_at: string
  name: string
  description: string
  image_url: string
  products: ProductType[]
}
