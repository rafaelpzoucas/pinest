export type PaymentType = {
  id: string
  amount: number
  payment_type: 'PIX' | 'CASH' | 'CREDIT' | 'DEBIT' | 'DEFERRED'
  created_at: string
  purchase_id: string
  table_id: string
  status: string
  purchase_items: {
    id: string
  }[]
  type: 'INCOME' | 'EXPENSE'
  discount: number
  description: string
}
