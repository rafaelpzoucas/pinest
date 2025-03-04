'use client'

import { StatusKey } from '@/app/[public_store]/purchases/[id]/status'
import { Badge } from '@/components/ui/badge'
import { cn, formatAddress, formatCurrencyBRL, formatDate } from '@/lib/utils'
import {
  CustomersType,
  PurchaseItemsType,
  PurchaseType,
} from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { ColumnDef } from '@tanstack/react-table'
import { PurchaseOptions } from './options'

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
      const type = row.original.type

      return (
        <div>
          <p className="text-muted-foreground">{customer.users.name}</p>
          <p className="text-xs">
            {customer &&
            customer.users &&
            customer.users.addresses &&
            type === 'delivery'
              ? formatAddress(customer.users.addresses[0])
              : 'Retirada na loja'}
          </p>
        </div>
      )
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
  {
    accessorKey: 'shipping_price',
    header: 'Frete',
    cell: ({ row }) => {
      const shippingPrice = row.getValue('shipping_price') as number

      return shippingPrice > 0 ? (
        formatCurrencyBRL(shippingPrice)
      ) : (
        <p>Grátis</p>
      )
    },
  },
  {
    accessorKey: 'change_value',
    header: 'Troco',
    cell: ({ row }) => {
      const changeValue = row.getValue('change_value') as number
      const totalAmount = row.getValue('total_amount') as number

      return changeValue ? (
        formatCurrencyBRL(changeValue - totalAmount)
      ) : (
        <p>-</p>
      )
    },
  },
  {
    accessorKey: 'id',
    header: 'Ações',
    cell: ({ row }) => {
      const currentStatus = row.original.status as string
      const accepted = row.original.accepted

      return (
        <PurchaseOptions
          accepted={accepted}
          purchaseId={row.getValue('id')}
          currentStatus={currentStatus}
        />
      )
    },
  },
]
