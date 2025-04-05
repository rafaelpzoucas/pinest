import { CustomerType } from './customer'

export type StoreCustomerType = {
  id: string
  created_at: string
  customer_id: string
  store_id: string
  notes: string
  balance: number
  purchases_quantity: number
  customers: CustomerType
}
