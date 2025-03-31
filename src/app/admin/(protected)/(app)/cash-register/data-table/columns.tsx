'use client'

import { formatCurrencyBRL, formatDate } from '@/lib/utils'
import { PaymentType } from '@/models/payment'
import { PAYMENT_TYPES } from '@/models/purchase'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<PaymentType>[] = [
  {
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string

      return formatDate(date, 'dd/MM - HH:mm:ss')
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as string

      return type === 'INCOME' ? 'Entrada' : 'Saída'
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'amount',
    header: 'Valor',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number

      return formatCurrencyBRL(amount)
    },
  },
  {
    accessorKey: 'payment_type',
    header: 'Método de pagamento',
    cell: ({ row }) => {
      const paymentType = row.getValue('payment_type') as string

      return PAYMENT_TYPES[paymentType as keyof typeof PAYMENT_TYPES]
    },
  },
]
