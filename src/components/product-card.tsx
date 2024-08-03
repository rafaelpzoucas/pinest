'use client'

import defaultThumbUrl from '@/../public/default_thumb_url.png'
import { ProductOptions } from '@/app/admin/(protected)/catalog/products/options'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ProductType } from '@/models/product'
import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from './ui/badge'

const productCardVariants = cva('text-sm leading-4', {
  variants: {
    variant: {
      default: 'grid grid-cols-[1fr_3fr] gap-4 items-start',
      featured: 'flex flex-col gap-2',
      bag_items: 'grid grid-cols-[1fr_5fr] gap-4 items-start',
      catalog:
        'relative grid grid-cols-[1fr_5fr] gap-4 items-start border p-3 rounded-lg bg-card',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof productCardVariants> {
  data?: ProductType
  publicStore?: string
}

export function ProductCard({
  data,
  className,
  variant,
  publicStore,
}: ProductCardProps) {
  const isPromotional = data?.promotional_price

  function getImageURL() {
    if (data && data.product_images && data.product_images.length > 0) {
      return data.product_images[0].image_url
    }

    return ''
  }

  const imageURL = getImageURL()

  const thumbURL = imageURL === '' ? defaultThumbUrl : imageURL

  if (!data) {
    return (
      <div className={cn(productCardVariants({ variant }))}>
        <Skeleton className="w-full min-w-14 aspect-square rounded-card" />

        <div className="flex flex-col gap-1">
          <div className="leading-4">
            <Skeleton className="w-2/3 h-3" />
          </div>

          <Skeleton className="w-full h-[0.875rem]" />
          <Skeleton className="w-1/2 h-[0.875rem]" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href={publicStore ? `/${publicStore}/products/${data.id}` : '#'}
      className={cn(
        productCardVariants({ variant }),
        'focus:outline-none focus:ring ring-offset-4 ring-offset-background rounded-xl',
        className,
      )}
    >
      <Card
        className={cn(
          'relative min-w-14 w-full aspect-square overflow-hidden border-0',
        )}
      >
        <Image src={thumbURL} fill alt="" className="object-cover" />

        {data.stock === 0 && (
          <Badge className="absolute z-20 top-2 left-2 bg-destructive/80 backdrop-blur-sm text-destructive-foreground">
            Indisponível
          </Badge>
        )}
      </Card>

      <div
        className={cn(
          'flex flex-col gap-1',
          variant === 'catalog' && 'flex-col-reverse',
        )}
      >
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
            variant === 'catalog' && 'line-clamp-2 max-w-[220px]',
          )}
        >
          {data.name}
        </p>

        {variant === 'catalog' && <ProductOptions product={data} />}
      </div>
    </Link>
  )
}
