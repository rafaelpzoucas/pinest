'use client'

import { Card } from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ProductType } from '@/models/product'
import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'
import Link from 'next/link'
import defaultThumbUrl from '../../../../../public/default_thumb_url.png'

const productCardVariants = cva('text-sm leading-4', {
  variants: {
    variant: {
      default: 'grid grid-cols-[1fr_3fr] gap-4 items-start',
      featured: 'flex flex-col gap-2',
      bag_items: 'grid grid-cols-[1fr_5fr] gap-4 items-start',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof productCardVariants> {
  data: ProductType
  publicStore?: string
}

export function ProductCard({ data, variant, publicStore }: ProductCardProps) {
  const isPromotional = data.promotional_price

  return (
    <Link
      href={`/${publicStore}/products/${data.id}`}
      className={cn(productCardVariants({ variant }))}
    >
      <Card
        className={cn(
          'relative min-w-14 w-full aspect-square overflow-hidden border-0',
        )}
      >
        <Image
          src={data.thumb_url ?? defaultThumbUrl}
          fill
          alt=""
          className="object-cover"
        />
      </Card>

      <div className="flex flex-col gap-1">
        <div className="leading-4">
          <p
            className={cn(
              'font-bold text-primary',
              isPromotional &&
                'font-light text-xs text-muted-foreground line-through',
            )}
          >
            {formatCurrencyBRL(data.price)}
          </p>

          {data.promotional_price && (
            <p
              className={cn(
                'hidden font-bold text-primary',
                isPromotional && 'block',
              )}
            >
              {formatCurrencyBRL(data.promotional_price)}
            </p>
          )}
        </div>

        <p
          className={cn(
            'line-clamp-2 text-muted-foreground text-sm',
            variant === 'bag_items' && 'line-clamp-1',
          )}
        >
          {data.name}
        </p>
      </div>
    </Link>
  )
}
