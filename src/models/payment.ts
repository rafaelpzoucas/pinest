export type PaymentType = {
  id: string
  amount: number
  payment_type: 'PIX' | 'CASH' | 'CREDIT' | 'DEBIT' | 'DEFERRED'
  created_at: string
  order_id: string
  table_id: string
  status: string
  order_items: {
    id: string
  }[]
  type: 'INCOME' | 'EXPENSE'
  discount: number
  description: string
}
