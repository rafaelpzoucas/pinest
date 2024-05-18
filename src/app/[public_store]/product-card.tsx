import { Card } from '@/components/ui/card'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import Image, { StaticImageData } from 'next/image'

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

export type ProductDataType = {
  thumb_url: StaticImageData
  title: string
  description: string
  price: number
  promotional_price: number
}

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof productCardVariants> {
  data: ProductDataType
}

export function ProductCard({ data, variant, className }: ProductCardProps) {
  const isPromotional = data.promotional_price > 0

  return (
    <div className={cn(productCardVariants({ variant, className }))}>
      <Card
        className={cn('relative w-full aspect-square overflow-hidden border-0')}
      >
        <Image src={data.thumb_url} fill alt="" className="object-cover" />
      </Card>

      <div className="flex flex-col gap-3">
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
          <p
            className={cn(
              'hidden font-bold text-primary',
              isPromotional && 'block',
            )}
          >
            {formatCurrencyBRL(data.promotional_price)}
          </p>
        </div>

        <p
          className={cn(
            'line-clamp-2 text-muted-foreground text-sm',
            variant === 'bag_items' && 'line-clamp-1',
          )}
        >
          {data.title}
        </p>
      </div>
    </div>
  )
}
