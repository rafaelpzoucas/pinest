export type PaymentType = {
  id: string
  amount: number
  payment_type: 'pix' | 'cash' | 'credit-card' | 'debit-card'
  created_at: string
  purchase_id: string
  table_id: string
  status: string
  purchase_items: {
    id: string
  }[]
}
