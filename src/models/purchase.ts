import { ProductType } from './product'

type PurchaseItemsType = {
  id: string
  created_at: string
  order_id: string
  product_id: string
  quantity: number
  products: ProductType
}

export type PurchaseType = {
  id: string
  created_at: string
  customer_id: string
  status: string
  total_amount: number
  purchase_items: PurchaseItemsType[]
}
