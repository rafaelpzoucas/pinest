'use client'

import { buttonVariants } from '@/components/ui/button'
import { useReadCart } from '@/features/store/cart-session/hooks'
import { useCart } from '@/stores/cart-store'
import { cn } from '@/utils/cn'
import { createPath } from '@/utils/createPath'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { CartProduct } from './cart-product'

export function CartProducts({ storeSlug }: { storeSlug: string }) {
  const { cart } = useCart()

  useReadCart({ subdomain: storeSlug })

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
          <Link
            href={createPath('/', storeSlug)}
            className={cn(
              buttonVariants({ variant: 'secondary' }),
              'w-full uppercase',
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar mais itens
          </Link>
        </div>
      )}
    </div>
  )
}
