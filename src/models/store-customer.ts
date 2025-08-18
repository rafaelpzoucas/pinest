import { CustomerType } from './customer'

export type StoreCustomerType = {
  id: string
  created_at: string
  customer_id: string
  store_id: string
  notes: string
  balance: number
  orders_quantity: number
  customers: CustomerType
}

export type AdminCustomerType = {
  id: string
  created_at: string
  customer_id: string
  store_id: string
  notes: string
  balance: number
  orders_quantity: number
  customers: CustomerType
}
