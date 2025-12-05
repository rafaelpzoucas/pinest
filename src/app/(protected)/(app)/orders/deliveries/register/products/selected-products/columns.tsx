'use client'

import { OrderItemsType } from '@/models/order'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<OrderItemsType>[] = [
  {
    accessorKey: 'name',
    header: 'Produto',
    cell({ row }) {
      const productName = row.original

      return productName
    },
  },
  {
    accessorKey: 'price',
    header: 'Valor',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantidade',
  },
  {
    accessorKey: 'total',
    header: 'Total',
  },
]
