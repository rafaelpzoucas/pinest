'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateOrder } from '@/features/_global/orders/hooks'
import {
  CreateOrder,
  OrderTypeEnum,
  PaymentTypeEnum,
} from '@/features/_global/orders/schemas'
import { useReadCart } from '@/features/store/cart-session/hooks'
import { useReadCustomer } from '@/features/store/customers/hooks'
import { CustomerAddress } from '@/features/store/customers/schemas'
import { useReadStoreShippings } from '@/features/store/shippings/hooks'
import {
  useReadStoreCustomer,
  useReadStoreId,
} from '@/features/store/store/hooks'
import { formatCurrencyBRL, stringToNumber } from '@/lib/utils'
import { useCart } from '@/stores/cart-store'
import { useCouponStore } from '@/stores/couponStore'
import { cn } from '@/utils/cn'
import { createPath } from '@/utils/createPath'
import { ArrowRight, Loader2, Plus, Send } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useCheckoutFlow } from '../checkout/hooks'
import { useBottomAction } from './hooks'

export function FinishOrder() {
  const params = useParams()
  const searchParams = useSearchParams()

  const { config } = useBottomAction()
  const { cart, deliveryPrice, setDeliveryPrice } = useCart()
  const { appliedCoupon } = useCouponStore()
  const { isLastStep } = useCheckoutFlow()

  const pickup = searchParams.get('pickup') as OrderTypeEnum
  const paymentType = searchParams.get('payment') as PaymentTypeEnum
  const isInCheckout = searchParams.get('step')
  const changeValue = searchParams.get('changeValue') ?? '0'

  const isDelivery = pickup === 'DELIVERY'
  const storeSlug = params?.store_slug as string

  useReadCart({ subdomain: storeSlug })

  const { data: storeIdData, isPending: isStoreIdPending } = useReadStoreId({
    storeSlug,
  })
  const { data: customerData, isPending: isCustomerPending } = useReadCustomer({
    subdomain: storeSlug,
  })

  const { data: shippingsData, isPending: isShippingsPending } =
    useReadStoreShippings({
      subdomain: storeSlug,
    })
  const { data: storeCustomerData, isPending: isStoreCustomerPending } =
    useReadStoreCustomer({
      customerId: customerData?.customer.id,
      storeId: storeIdData?.storeId,
    })
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()

  const isLoading =
    isStoreIdPending ||
    isCustomerPending ||
    isShippingsPending ||
    isCreatingOrder ||
    isStoreCustomerPending

  const customer = customerData?.customer
  const storeCustomer = storeCustomerData?.storeCustomer
  const storeId = storeIdData?.storeId
  const customerAddress = customer?.address as CustomerAddress
  const deliveryTime = shippingsData?.storeShippings.delivery_time ?? 0
  const takeoutTime = shippingsData?.storeShippings.pickup_time ?? 0
  const shippingPrice = shippingsData?.storeShippings.price ?? 0
  const cartSessionId = cart && cart.length > 0 ? cart[0].session_id : undefined

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

  const isVisible = !!config.showFinishOrder && cart.length > 0

  const finishOrderLink = !customerData
    ? createPath('/account?checkout=true', storeSlug)
    : createPath('/checkout?step=pickup', storeSlug)

  useEffect(() => {
    setDeliveryPrice(shippingPrice)
  }, [shippingPrice, isDelivery, setDeliveryPrice])

  const handleCreateOrder = async () => {
    if (!isCreatingOrder) {
      const newOrderData: CreateOrder = {
        cart_session_id: cartSessionId,
        store_subdomain: storeSlug,
        customer_id: storeCustomer?.id as string,
        status: 'accept',
        store_id: storeId,
        type: pickup,
        payment_type: paymentType,
        order_items: cart.map((item) => ({
          product_id: item.product_id as string,
          quantity: item.quantity,
          product_price: item.product_price,
          observations: item.observations,
          extras: item.extras,
        })),
        delivery: {
          time: isDelivery ? deliveryTime : takeoutTime,
          address: customerAddress,
        },
        coupon_id: appliedCoupon?.coupon_id,
        coupon_code: appliedCoupon?.code,
        total: {
          subtotal,
          discount,
          shipping_price: isDelivery ? deliveryPrice : 0,
          total_amount: totalPrice,
          change_value: stringToNumber(changeValue) ?? 0,
        },
      }

      createOrder(newOrderData)
    }
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
            href={finishOrderLink}
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
            disabled={isLoading}
          >
            {isCreatingOrder ? (
              <div className="flex flex-row items-center">
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                <span>Enviando seu pedido...</span>
              </div>
            ) : (
              <>
                <span>Fazer pedido</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
