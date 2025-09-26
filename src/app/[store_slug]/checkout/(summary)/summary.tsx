'use client'

import { useReadCart } from '@/features/store/cart-session/hooks'
import { useCart } from '@/stores/cart-store'
import { useParams } from 'next/navigation'
import { CartProduct } from '../../cart/cart-product'
import { CouponField } from './coupon-field'
import { Payment } from './payment'
import { Pickup } from './pickup'

export default function SummaryStep() {
  const params = useParams()

  const { cart } = useCart()

  const storeSlug = params.store_slug as string

  useReadCart({ subdomain: storeSlug })

  return (
    <div className="flex flex-col w-full">
      <CouponField />
      <Pickup />
      <Payment />

      <section className="flex flex-col items-start gap-2 py-6">
        {cart &&
          cart.map((item) => (
            <CartProduct
              key={item.id}
              cartProduct={item}
              storeSlug={storeSlug}
            />
          ))}
      </section>
    </div>
  )
}
