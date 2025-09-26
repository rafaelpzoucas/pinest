import { OrderItemsType } from './order'

export type TableType = {
  id: string
  created_at: string
  store_id: string
  number: number
  description: string
  order_items: OrderItemsType[]
}
