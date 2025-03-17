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
import { GuestType } from '@/models/user'
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
      const guest = row.original.guest_data as GuestType
      const type = row.original.type
      const customerAddress =
        customer &&
        customer.users &&
        customer.users.addresses &&
        customer.users.addresses[0]

      return (
        <div className="max-w-[280px]">
          <p className="capitalize">
            {(
              customer?.users?.name ??
              customer?.name ??
              guest?.name
            ).toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground">
            {type === 'delivery'
              ? (formatAddress(customerAddress ?? guest?.address) ??
                customer.address)
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
    accessorKey: 'discount',
    header: 'Desconto',
    cell: ({ row }) => {
      const discount = row.getValue('discount') as number

      return discount ? formatCurrencyBRL(discount) : <p>-</p>
    },
  },
  {
    accessorKey: 'total_amount',
    header: 'Total',
    cell: ({ row }) => {
      const totalAmount = row.getValue('total_amount') as number
      const discount = row.original.discount ?? 0

      return (
        <div>
          {discount > 0 && (
            <span className="line-through text-xs text-muted-foreground">
              {formatCurrencyBRL(totalAmount)}
            </span>
          )}
          <p>{formatCurrencyBRL(totalAmount - discount)}</p>
        </div>
      )
    },
  },
  {
    accessorKey: 'id',
    header: 'Ações',
    cell: ({ row }) => {
      const currentStatus = row.original.status as string
      const accepted = row.original.accepted
      const discount = row.original.discount

      return (
        <PurchaseOptions
          accepted={accepted}
          purchaseId={row.getValue('id')}
          currentStatus={currentStatus}
          discount={discount}
        />
      )
    },
  },
]
