'use client'

import { ProductCardImage } from '@/components/product-card-image'
import { formatCurrencyBRL } from '@/lib/utils'
import { ProductImageType, ProductType } from '@/models/product'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<ProductType>[] = [
  {
    accessorKey: 'product_images',
    header: 'Imagem',
    cell: ({ row }) => {
      const productImages = row.getValue('product_images') as ProductImageType[]

      return <ProductCardImage productImages={productImages} />
    },
  },
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
]
