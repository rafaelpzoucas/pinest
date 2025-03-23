import { CustomerType } from './customer'
import { ExtraType } from './extras'
import { ProductType, ProductVariationType } from './product'
import { AddressType, GuestType, UserType } from './user'

export const PAYMENT_TYPES = {
  CREDIT: 'Cartão de crédito',
  DEBIT: 'Cartão de débito',
  PIX: 'PIX',
  CASH: 'Dinheiro',
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
  is_paid: boolean
  printed: boolean
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
  delivery_time: number
  type: string
  payment_type: string
  tracking_code: string
  is_ifood: boolean
  ifood_order_data: any
  purchase_items: PurchaseItemsType[]
  purchase_item_variations: PurchaseItemVariations[]
  addresses: AddressType
  customers: CustomersType
  guest_data: GuestType
  observations?: string
  total: {
    shipping_price: number
    change_value: number
    discount: number
    total_amount: number
    subtotal: number
  }
}
