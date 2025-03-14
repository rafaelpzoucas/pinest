import { CustomerType } from './customer'
import { ExtraType } from './extras'
import { ProductType, ProductVariationType } from './product'
import { AddressType, GuestType, UserType } from './user'

export const PAYMENT_TYPES = {
  card: 'Cartão',
  pix: 'PIX',
  cash: 'Dinheiro',
}

export interface CustomersType extends CustomerType {
  users: UserType
}

export type CreatePurchaseType = {
  totalAmount: number
  storeName: string
  addressId?: string | null
  shippingPrice: number
  shippingTime: number
  type: string
  payment_type: string
  changeValue: number | null
}

export type PurchaseItemsType = {
  id: string
  created_at: string
  order_id: string
  product_id: string
  quantity: number
  product_price: number
  products: ProductType
  observations: string
  extras: ExtraType[]
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
  store_id: string
  total_amount: number
  shipping_price: number
  delivery_time: number
  type: string
  payment_type: string
  tracking_code: string
  accepted: boolean
  change_value: number
  purchase_items: PurchaseItemsType[]
  purchase_item_variations: PurchaseItemVariations[]
  addresses: AddressType
  customers: CustomersType
  guest_data: GuestType
  discount: number
}
