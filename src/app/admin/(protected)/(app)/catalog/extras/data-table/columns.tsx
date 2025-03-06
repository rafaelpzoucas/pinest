'use client'

import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { ColumnDef } from '@tanstack/react-table'
import { ExtraOptions } from '../options'

export const columns: ColumnDef<ExtraType>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'price',
    header: 'Preço',
    cell: ({ row }) => {
      const price = row.getValue('price') as number

      return formatCurrencyBRL(price)
    },
  },
  {
    accessorKey: 'id',
    header: 'Ações',
    cell: ({ row }) => <ExtraOptions extraId={row.getValue('id')} />,
  },
]
