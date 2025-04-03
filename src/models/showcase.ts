import { ProductType } from './product'

export type ShowcaseType = {
  id: string
  created_at: string
  name: string
  description: string
  order_by: string
  status: boolean
  position: number
  products: ProductType[]
}
