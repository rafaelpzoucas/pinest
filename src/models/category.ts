import { ProductType } from './product'

export type CategoryType = {
  id: string
  created_at: string
  name: string
  description: string
  products: ProductType[]
}
