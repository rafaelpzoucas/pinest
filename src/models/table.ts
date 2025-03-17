import { PurchaseItemsType } from './purchase'

export type TableType = {
  id: string
  created_at: string
  store_id: string
  number: number
  purchase_items: PurchaseItemsType[]
}
