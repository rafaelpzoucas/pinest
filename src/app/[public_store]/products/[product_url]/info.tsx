'use client'

import { cn, formatCurrencyBRL } from '@/lib/utils'
import { AddressType } from '@/models/address'
import { CartProductType } from '@/models/cart'
import { ExtraType } from '@/models/extras'
import { ProductType, ProductVariationType } from '@/models/product'
import { useProduct } from '@/stores/productStore'
import { AddToCard } from './add-to-cart'
import { ShippingForm } from './shipping/form'

export function ProductInfo({
  isOpen,
  product,
  variations,
  storeAddress,
  cartProduct,
  extras,
}: {
  isOpen?: boolean
  product?: ProductType
  variations?: ProductVariationType[]
  storeAddress: AddressType
  cartProduct?: CartProductType
  extras?: ExtraType[]
}) {
  if (!product) {
    return null
  }

  const isPromotional = product?.promotional_price
  const { productPrice } = useProduct()

  const productHasDimensions =
    product.pkg_height !== null &&
    product.pkg_width !== null &&
    product.pkg_length !== null &&
    product.pkg_weight !== null

  return (
    <section className="space-y-6 mt-6 lg:mt-0 lg:space-y-12">
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
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </div>

      <AddToCard
        isOpen={isOpen}
        product={product}
        variations={variations}
        cartProduct={cartProduct}
        extras={extras}
      />

      {productHasDimensions && (
        <ShippingForm storeAddress={storeAddress} product={product} />
      )}
    </section>
  )
}
