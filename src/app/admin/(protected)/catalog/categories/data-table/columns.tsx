'use client'

import { CategoryType } from '@/models/category'
import { ProductType } from '@/models/product'
import { ColumnDef } from '@tanstack/react-table'
import { CategoryOptions } from '../options'

export const columns: ColumnDef<CategoryType>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
  },
  {
    accessorKey: 'products',
    header: 'Produtos',
    cell: ({ row }) => {
      const products = row.getValue('products') as ProductType[]

      return products.length
    },
  },
  {
    accessorKey: 'id',
    header: 'Ações',
    cell: ({ row }) => {
      const categoryId = row.getValue('id') as string

      return <CategoryOptions categoryId={categoryId} />
    },
  },
]
