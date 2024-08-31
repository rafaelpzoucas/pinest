'use client'

import { StatusKey } from '@/app/[public_store]/purchases/[id]/status'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrencyBRL, formatDate } from '@/lib/utils'
import {
  CustomersType,
  PurchaseItemsType,
  PurchaseType,
} from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<PurchaseType>[] = [
  {
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string

      return formatDate(date, 'dd/MM/yyyy - HH:mm')
    },
  },
  {
    accessorKey: 'customers',
    header: 'Cliente',
    cell: ({ row }) => {
      const customer = row.getValue('customers') as CustomersType

      return customer.users.name
    },
  },
  {
    accessorKey: 'purchase_items',
    header: 'Produtos',
    cell: ({ row }) => {
      const items = row.getValue('purchase_items') as PurchaseItemsType[]

      return items.length
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge className={cn(statuses[status as StatusKey].color)}>
          {statuses[status as StatusKey].status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'total_amount',
    header: 'Valor',
    cell: ({ row }) => {
      const totalAmount = row.getValue('total_amount') as number

      return formatCurrencyBRL(totalAmount)
    },
  },
]
