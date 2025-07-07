'use client'

import defaultThumbUrl from '@/../public/default_thumb_url.png'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrencyBRL, getRootPath } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { PurchaseItemVariations } from '@/models/purchase'
import { cva, type VariantProps } from 'class-variance-authority'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from './ui/badge'

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
  data?: ProductType
  variations?: PurchaseItemVariations[]
  observations?: string[]
  extras?: ExtraType[]
  quantity?: number
  storeSubdomain?: string
}

export function ProductCard({
  data,
  variations,
  className,
  variant,
  observations,
  extras,
  quantity,
  storeSubdomain,
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

  const filteredObservations =
    observations &&
    observations.length > 0 &&
    observations?.filter((obs) => obs !== '')

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

  const rootPath = getRootPath(storeSubdomain)

  const productLink = rootPath
    ? `/${rootPath}/products/${data.product_url}`
    : `/products/${data.product_url}`

  return (
    <Link
      href={productLink}
      className={cn(
        productCardVariants({ variant }),
        'focus:outline-none focus:ring ring-offset-4 ring-offset-background rounded-xl',
        className,
      )}
    >
      {variant === 'bag_items' ? (
        <h3 className="text-2xl font-bold">x{quantity}</h3>
      ) : (
        <Card
          className={cn(
            'relative min-w-14 w-full aspect-square overflow-hidden border-0',
          )}
        >
          <Image src={thumbURL} fill alt="" className="object-cover" />

          {variant && data.stock === 0 && (
            <Badge
              className="absolute z-20 top-2 left-2 bg-destructive/80 backdrop-blur-sm
                text-destructive-foreground"
            >
              Indisponível
            </Badge>
          )}
        </Card>
      )}

      <div className={cn('flex flex-col gap-1')}>
        <div
          className={cn(
            variant === 'bag_items'
              ? 'flex flex-row items-center justify-between'
              : 'flex flex-col-reverse gap-1',
          )}
        >
          <p
            className={cn(
              'line-clamp-2 text-sm',
              variant === 'bag_items' && 'line-clamp-1',
            )}
          >
            {data.name}
          </p>
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
        </div>

        {variant !== 'bag_items' && (
          <p className="line-clamp-3 text-muted-foreground text-xs">
            {data.description}
          </p>
        )}

        {extras &&
          extras.length > 0 &&
          extras.map((extra) => (
            <p
              key={extra.id}
              className="flex flex-row items-center justify-between text-xs text-muted-foreground
                line-clamp-2 w-full"
            >
              <span className="flex flex-row items-center">
                <Plus className="w-4 h-4 mr-1" /> {extra.quantity} ad.{' '}
                {extra.name}
              </span>

              <span>{formatCurrencyBRL(extra.price * extra.quantity)}</span>
            </p>
          ))}

        {filteredObservations &&
          filteredObservations.length > 0 &&
          filteredObservations.map((obs) => (
            <p className="text-xs text-muted-foreground uppercase line-clamp-2">
              obs: {obs}{' '}
            </p>
          ))}

        <div>
          {variations &&
            variations.map((variation) => (
              <Badge key={variation.id} variant="outline" className="mr-2">
                {variation.product_variations.name}
              </Badge>
            ))}
        </div>
      </div>
    </Link>
  )
}
