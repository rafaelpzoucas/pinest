'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useReadCart } from '@/features/store/cart-session/hooks'
import { useReadStoreCustomer } from '@/features/store/customers/hooks'
import { useReadStoreShippings } from '@/features/store/shippings/hooks'
import { createPath, formatCurrencyBRL } from '@/lib/utils'
import { useCart } from '@/stores/cart-store'
import { cn } from '@/utils/cn'
import { ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useBottomAction } from './hooks'

export function FinishOrder() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { config } = useBottomAction()
  const { deliveryPrice, setDeliveryPrice } = useCart()

  const isDelivery = searchParams.get('pickup') === 'DELIVERY'

  const storeSlug = params?.store_slug as string

  useReadCart({ subdomain: storeSlug })

  const { data: customerData } = useReadStoreCustomer({ subdomain: storeSlug })
  const { data: shippingsData } = useReadStoreShippings({
    subdomain: storeSlug,
  })

  const shippingPrice = shippingsData?.storeShippings.price ?? 0

  const totalItems = useCart((state) =>
    state.cart.reduce((total, item) => total + item.quantity, 0),
  )

  const subtotal = useCart((state) =>
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

  const totalPrice = subtotal + deliveryPrice

  const isVisible = !!config.showFinishOrder

  const finishPurchaseLink = !customerData
    ? createPath('/account?checkout=true', storeSlug)
    : createPath('/checkout?step=pickup', storeSlug)

  useEffect(() => {
    setDeliveryPrice(shippingPrice)
  }, [shippingPrice, isDelivery, setDeliveryPrice])

  return (
    <div
      className="flex flex-col bg-background translate-y-full absolute opacity-0
        data-[visible=true]:translate-y-0 data-[visible=true]:static
        data-[visible=true]:opacity-100 transition-all duration-200 z-30"
      data-visible={isVisible}
    >
      <div className="p-2">
        <Card className="p-4 w-full space-y-3">
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

          <div className="flex flex-row justify-between text-xs text-muted-foreground">
            <p>Produtos ({totalItems})</p>
            <span>{formatCurrencyBRL(subtotal)}</span>
          </div>

          {isDelivery && (
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Entrega</p>
              <span>{formatCurrencyBRL(deliveryPrice)}</span>
            </div>
          )}

          <div className="flex flex-row justify-between text-lg pb-2">
            <p>Total</p>
            <strong>{formatCurrencyBRL(totalPrice - 0)}</strong>
          </div>
        </Card>
      </div>

      <Link
        href={finishPurchaseLink}
        className="flex flex-row items-center justify-between w-full max-w-md h-[68px] bg-primary
          text-primary-foreground p-4 font-bold uppercase hover:opacity-80
          active:scale-[0.98] transition-all duration-75"
      >
        <span>Finalizar pedido</span>
        <ArrowRight />
      </Link>
    </div>
  )
}
