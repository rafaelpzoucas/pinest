'use client'

import { PurchaseItemsType } from '@/models/purchase'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<PurchaseItemsType>[] = [
  {
    accessorKey: 'name',
    header: 'Produto',
    cell({ row }) {
      const productName = row.original

      console.log({ productName })

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
