'use client'

import { cn, formatCurrencyBRL } from '@/lib/utils'
import { ProductType, ProductVariationType } from '@/models/product'
import { useProduct } from '@/stores/productStore'
import { AddToCard } from './add-to-cart'

export function ProductInfo({
  product,
  variations,
  publicStore,
}: {
  product: ProductType
  variations: ProductVariationType[] | null
  publicStore: string
}) {
  const isPromotional = product?.promotional_price
  const { productPrice } = useProduct()

  return (
    <section className="mt-6 lg:mt-0 space-y-6 lg:space-y-12">
      <div className="lg:flex flex-col-reverse gap-4">
        <div className="leading-4">
          {product.promotional_price && (
            <p
              className={cn(
                'font-bold text-primary',
                isPromotional &&
                  'font-light text-xs text-muted-foreground line-through',
              )}
            >
              {formatCurrencyBRL(product.price)}
            </p>
          )}

          <p className={cn('font-bold text-primary text-xl lg:text-3xl')}>
            {formatCurrencyBRL(productPrice)}
          </p>
        </div>
        <h1 className="text-lg lg:text-xl capitalize font-bold">
          {product.name}
        </h1>
      </div>

      <AddToCard
        publicStore={publicStore}
        product={product}
        variations={variations}
      />

      <p className="text-sm text-muted-foreground">{product.description}</p>
    </section>
  )
}
