import { CustomerType } from './customer'
import { ProductType, ProductVariationType } from './product'
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

export type PurchaseItemVariations = {
  id: string
  created_at: string
  variation_id: string
  purchase_id: string
  product_variations: ProductVariationType
}

export type PurchaseType = {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  status: string
  total_amount: number
  shipping_price: number
  delivery_time: number
  purchase_items: PurchaseItemsType[]
  purchase_item_variations: PurchaseItemVariations[]
  addresses: AddressType
  customers: CustomersType
}
