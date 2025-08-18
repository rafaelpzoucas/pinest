'use client'

import { buttonVariants } from '@/components/ui/button'
import { useReadCart } from '@/features/store/cart-session/hooks'
import { useCart } from '@/stores/cart-store'
import { cn } from '@/utils/cn'
import { createPath } from '@/utils/createPath'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useBottomAction } from './hooks'

export function Cart() {
  const params = useParams()

  const storeSlug = params?.store_slug as string

  const { config } = useBottomAction()

  const totalItems = useCart((state) =>
    state.cart.reduce((total, item) => total + item.quantity, 0),
  )

  const totalPrice = useCart((state) =>
    state.cart.reduce((total, item) => {
      const itemTotal = item.product_price
      const extrasTotal =
        item.extras?.reduce(
          (total, extra) => total + extra.price * extra.quantity,
          0,
        ) || 0
      return total + (itemTotal + extrasTotal) * item.quantity
    }, 0),
  )

  useReadCart({ subdomain: storeSlug })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const isVisible = config.showCart && totalItems > 0

  const cartLink = createPath('/cart', storeSlug)

  return (
    <div
      className="p-3 translate-y-full absolute opacity-0 data-[visible=true]:translate-y-0
        data-[visible=true]:static data-[visible=true]:opacity-100 active:scale-[0.98]
        transition-all duration-200 z-40"
      data-visible={isVisible}
    >
      <Link
        href={cartLink}
        className={cn(
          buttonVariants(),
          'w-full h-14 text-base rounded-lg shadow-lg backdrop-blur-lg font-bold',
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <ShoppingCart />
            <span className="uppercase">Ver Carrinho</span>
            <span>({totalItems})</span>
          </div>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </Link>
    </div>
  )
}
