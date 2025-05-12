import { z } from 'zod'

export const openCashSessionSchema = z.object({
  opening_balance: z.string(),
})

export const closeCashSessionSchema = z.object({
  closing_balance: z.string(),
  cash_balance: z.string(),
  credit_balance: z.string(),
  debit_balance: z.string(),
  pix_balance: z.string(),
})

export const createTransactionFormSchema = z.object({
  amount: z.string({ message: 'Insira o valor da transação.' }),
  payment_type: z.enum(['PIX', 'CASH', 'CREDIT', 'DEBIT'], {
    message: 'Selecione o método de pagamento.',
  }),
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: 'Selecione o tipo de transação.',
  }),
  description: z.string({ message: 'Insira uma descrição.' }),
})
