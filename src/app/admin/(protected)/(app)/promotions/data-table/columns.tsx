'use client'

import { ColumnDef } from '@tanstack/react-table'
import { CouponFormValues } from '../coupons/schema'
import { CouponOptions } from './options'

export const columns: ColumnDef<CouponFormValues>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'code',
    header: 'Código',
    cell: ({ row }) => (
      <span className="font-mono">{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'discount',
    header: 'Desconto',
    cell: ({ row }) => {
      const value = row.getValue('discount') as number
      const type = row.original.discount_type
      return (
        <span>
          {type === 'percent' ? `${value}%` : `R$ ${value.toFixed(2)}`}
        </span>
      )
    },
  },
  {
    accessorKey: 'discount_type',
    header: 'Tipo',
    cell: ({ row }) =>
      row.getValue('discount_type') === 'percent' ? 'Porcentagem' : 'Fixo',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      if (status === 'active') return 'Ativo'
      if (status === 'disabled') return 'Desativado'
      if (status === 'expired') return 'Expirado'
      return status
    },
  },
  {
    accessorKey: 'expires_at',
    header: 'Expira em',
    cell: ({ row }) => {
      const date = row.getValue('expires_at')
      return date ? new Date(date as string).toLocaleDateString('pt-BR') : '-'
    },
  },
  {
    accessorKey: 'usage_count',
    header: 'Usos',
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => <CouponOptions id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
]
