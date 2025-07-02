'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrencyBRL } from '@/lib/utils'
import { PurchaseItemsType } from '@/models/purchase'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Check } from 'lucide-react'
import { SplitTitem } from './split-item'

export const columns: ColumnDef<PurchaseItemsType>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const selectableRows = table
        .getRowModel()
        .rows.filter((row) => !row.original.is_paid)

      return (
        <Checkbox
          checked={
            selectableRows.every((row) => row.getIsSelected()) ||
            (selectableRows.some((row) => row.getIsSelected()) &&
              'indeterminate')
          }
          onCheckedChange={(value) => {
            selectableRows.forEach((row) => row.toggleSelected(!!value))
          }}
          aria-label="Select all"
        />
      )
    },
    cell: ({ row }) => {
      const isPaid = row.original.is_paid

      return (
        <Checkbox
          disabled={isPaid}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'split',
    header: 'Dividir',
    cell: ({ row }) =>
      !row.original.is_paid && <SplitTitem item={row.original} />,
  },
  {
    accessorKey: 'created_at',
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string

      return (
        <span className="text-xs text-muted-foreground">
          {format(date, 'dd/MM HH:mm:ss')}
        </span>
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Produto',
    cell: ({ row }) => {
      const productName =
        row.original?.products?.name ?? row.original.description

      return productName
    },
  },

  {
    accessorKey: 'quantity',
    header: 'Quantidade',
  },
  {
    accessorKey: 'product_price',
    header: 'Valor',
    cell: ({ row }) => formatCurrencyBRL(row.getValue('product_price')),
  },
  {
    accessorKey: 'is_paid',
    header: 'Status',
    cell: ({ row }) =>
      row.original.is_paid && (
        <div className="flex flex-row items-center gap-2">
          <Check className="w-4 h-4" /> Pago
        </div>
      ),
  },
]
