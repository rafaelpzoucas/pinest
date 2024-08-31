import { CustomerType } from './customer'
import { ProductType } from './product'
import { AddressType, UserType } from './user'

export interface CustomersType extends CustomerType {
  users: UserType
}

export type PurchaseItemsType = {
  id: string
  created_at: string
  order_id: string
  product_id: string
  quantity: number
  product_price: number
  products: ProductType
}

export type PurchaseType = {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  status: string
  total_amount: number
  purchase_items: PurchaseItemsType[]
  addresses: AddressType
  customers: CustomersType
}
