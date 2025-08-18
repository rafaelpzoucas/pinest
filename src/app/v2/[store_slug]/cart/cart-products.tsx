'use client'

import { CartItem } from '@/features/store/cart-session/schemas'
import { useCart } from '@/stores/cart-store'
import { ShoppingCart } from 'lucide-react'
import { useEffect } from 'react'
import { CartProduct } from './cart-product'

export function CartProducts({
  cart,
  storeSlug,
}: {
  cart?: CartItem[]
  storeSlug: string
}) {
  const { setCart } = useCart()

  useEffect(() => {
    if (cart) {
      setCart(cart)
    }
  }, [cart, setCart])

  return (
    <div className="lg:h-[370px] p-1 pr-2">
      {cart && cart.length > 0 ? (
        cart.map((product) => (
          <CartProduct
            key={product.id}
            cartProduct={product}
            storeSlug={storeSlug}
          />
        ))
      ) : (
        <div
          className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto h-full
            text-muted py-4"
        >
          <ShoppingCart className="w-20 h-20" />
          <p className="text-center text-muted-foreground">
            Você não possui produtos no carrinho
          </p>
        </div>
      )}
    </div>
  )
}
