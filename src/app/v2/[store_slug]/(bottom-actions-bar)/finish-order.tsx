'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useReadCart } from '@/features/store/cart-session/hooks'
import { useReadStoreCustomer } from '@/features/store/customers/hooks'
import { useReadStoreShippings } from '@/features/store/shippings/hooks'
import { formatCurrencyBRL } from '@/lib/utils'
import { useCart } from '@/stores/cart-store'
import { useCouponStore } from '@/stores/couponStore'
import { cn } from '@/utils/cn'
import { createPath } from '@/utils/createPath'
import { ArrowRight, Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useCheckoutFlow } from '../checkout/hooks'
import { useBottomAction } from './hooks'

export function FinishOrder() {
  const params = useParams()
  const searchParams = useSearchParams()

  const { config } = useBottomAction()
  const { deliveryPrice, setDeliveryPrice } = useCart()
  const { appliedCoupon } = useCouponStore()
  const { isLastStep } = useCheckoutFlow()

  const isDelivery = searchParams.get('pickup') === 'DELIVERY'
  const isInCheckout = searchParams.get('step')

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

  const discount = appliedCoupon?.discount ?? 0

  const totalPrice = subtotal - discount + (isDelivery ? deliveryPrice : 0)

  const isVisible = !!config.showFinishOrder

  const finishPurchaseLink = !customerData
    ? createPath('/account?checkout=true', storeSlug)
    : createPath('/checkout?step=pickup', storeSlug)

  useEffect(() => {
    setDeliveryPrice(shippingPrice)
  }, [shippingPrice, isDelivery, setDeliveryPrice])

  // Função para criar a order (implementar depois)
  const handleCreateOrder = async () => {
    // TODO: Implementar lógica de criação da order
    console.log('Criando pedido...', {
      subtotal,
      discount,
      deliveryPrice: isDelivery ? deliveryPrice : 0,
      totalPrice,
      appliedCoupon,
    })
  }

  return (
    <div
      className="flex flex-col translate-y-full absolute opacity-0
        data-[visible=true]:translate-y-0 data-[visible=true]:static
        data-[visible=true]:opacity-100 transition-all duration-200 z-30"
      data-visible={isVisible}
    >
      <div className="p-3">
        <Card className="p-4 w-full space-y-3">
          {!isInCheckout ? (
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
          ) : null}

          <div className="flex flex-row justify-between text-xs text-muted-foreground">
            <p>Produtos {totalItems ? `(${totalItems})` : null}</p>
            <span>
              {subtotal ? (
                formatCurrencyBRL(subtotal)
              ) : (
                <Skeleton className="h-3 w-16" />
              )}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Desconto {appliedCoupon ? `(cupom)` : null}</p>
              <span className="text-emerald-500">
                {formatCurrencyBRL(discount * -1)}
              </span>
            </div>
          )}

          {isDelivery && (
            <div className="flex flex-row justify-between text-xs text-muted-foreground">
              <p>Entrega</p>
              <span>
                {deliveryPrice ? (
                  formatCurrencyBRL(deliveryPrice)
                ) : (
                  <Skeleton className="h-3 w-16" />
                )}
              </span>
            </div>
          )}

          <div className="flex flex-row justify-between text-lg">
            <p>Total</p>
            <strong>
              {totalPrice ? (
                formatCurrencyBRL(totalPrice - 0)
              ) : (
                <Skeleton className="h-[18px] w-24" />
              )}
            </strong>
          </div>
        </Card>
      </div>

      <div className="bg-background">
        {!isInCheckout && !isLastStep && (
          <Link
            href={finishPurchaseLink}
            className="flex flex-row items-center justify-between w-full max-w-md h-[68px] bg-primary
              text-primary-foreground p-4 font-bold uppercase hover:opacity-80
              active:scale-[0.98] transition-all duration-75"
          >
            <span>Forma de entrega</span>
            <ArrowRight />
          </Link>
        )}

        {isInCheckout && isLastStep && (
          <button
            onClick={handleCreateOrder}
            className="flex flex-row items-center justify-between w-full max-w-md h-[68px] bg-primary
              text-primary-foreground p-4 font-bold uppercase hover:opacity-80
              active:scale-[0.98] transition-all duration-75 disabled:opacity-50"
          >
            <span>Fazer pedido</span>
            <ShoppingCart className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
