import { addressSchema } from '@/app/[public_store]/account/register/schemas'
import {
  paymentTypeEnum,
  purchaseTypeEnum,
} from '@/app/admin/(protected)/(app)/purchases/deliveries/register/schemas'
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

export type PurchaseItemsType = {
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
  type: z.infer<typeof purchaseTypeEnum>
  payment_type: z.infer<typeof paymentTypeEnum>
  is_ifood: boolean
  is_paid: boolean
  ifood_order_data: any
  purchase_items: PurchaseItemsType[]
  purchase_item_variations: PurchaseItemVariations[]
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
