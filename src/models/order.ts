import {
  orderTypeEnum,
  paymentTypeEnum,
} from '@/app/admin/(protected)/(app)/orders/deliveries/register/schemas'
import { addressSchema } from '@/app/old-store/account/register/schemas'
import { z } from 'zod'
import { CustomerType } from './customer'
import { ExtraType } from './extras'
import { ProductType, ProductVariationType } from './product'
import { StoreCustomerType } from './store-customer'
import { UserType } from './user'

export const PAYMENT_TYPES = {
  CREDIT: 'Cartão de crédito',
  DEBIT: 'Cartão de débito',
  PIX: 'PIX',
  CASH: 'Dinheiro',
  DEFERRED: 'Prazo',
}

export interface CustomersType extends CustomerType {
  users: UserType
}

export type OrderItemsType = {
  id: string
  created_at: string
  order_id: string
  product_id: string
  quantity: number
  product_price: number
  products: ProductType
  observations: string[]
  is_paid: boolean
  printed: boolean
  extras: ExtraType[]
  description: string
}

export type OrderItemVariations = {
  id: string
  created_at: string
  variation_id: string
  order_id: string
  product_variations: ProductVariationType
}

export type OrderType = {
  id: string
  display_id: number
  created_at: string
  updated_at: string
  customer_id: string
  status: string
  store_id: string
  type: z.infer<typeof orderTypeEnum>
  payment_type: z.infer<typeof paymentTypeEnum>
  is_ifood: boolean
  is_paid: boolean
  ifood_order_data: any
  order_items: OrderItemsType[]
  order_item_variations: OrderItemVariations[]
  store_customers: StoreCustomerType
  observations?: string
  total: {
    shipping_price: number
    change_value: number
    discount: number
    total_amount: number
    subtotal: number
  }
  delivery: {
    time: string
    address: z.infer<typeof addressSchema>
  }
}
