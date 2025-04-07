import { ProductCardImage } from '@/components/product-card-image'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ProductType } from '@/models/product'
import { ProductOptions } from './options'

export function ProductCard({ product }: { product?: ProductType }) {
  const isPromotional = product?.promotional_price

  if (!product) {
    return (
      <Card>
        <Skeleton className="w-full min-w-14 aspect-square rounded-card" />

        <div className="flex flex-col gap-1">
          <div className="leading-4">
            <Skeleton className="w-2/3 h-3" />
          </div>

          <Skeleton className="w-full h-[0.875rem]" />
          <Skeleton className="w-1/2 h-[0.875rem]" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="relative p-3">
      <div className="grid grid-cols-[1fr_5fr] gap-4 items-start">
        <ProductCardImage productImages={product.product_images} />

        <div className={'flex flex-col gap-1'}>
          <p
            className={
              'line-clamp-2 text-muted-foreground text-sm max-w-[220px]'
            }
          >
            {product.name}
          </p>

          <div className="leading-4">
            <p
              className={cn(
                'text-sm text-primary',
                isPromotional &&
                  'font-light text-xs text-muted-foreground line-through',
              )}
            >
              {formatCurrencyBRL(product.price)}
            </p>

            {product.promotional_price && (
              <p
                className={cn(
                  'hidden font-bold text-primary',
                  isPromotional && 'block',
                )}
              >
                {formatCurrencyBRL(product.promotional_price)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-1 right-1">
        <ProductOptions product={product} />
      </div>

      <footer className="flex flex-row justify-between border-t pt-2 mt-3">
        <p className="text-xs text-muted-foreground">
          Estoque: {product.stock ?? 'Infinito'}
        </p>
        <p className="text-xs text-muted-foreground">
          Vendidos: {product.amount_sold}
        </p>
      </footer>
    </Card>
  )
}
