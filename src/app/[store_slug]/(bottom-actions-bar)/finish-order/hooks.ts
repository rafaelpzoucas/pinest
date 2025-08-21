'use client'

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
import { stringToNumber } from '@/lib/utils'
import { useCart } from '@/stores/cart-store'
import { useCouponStore } from '@/stores/couponStore'
import { useParams, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'

export function useFinishOrder() {
  const params = useParams()
  const searchParams = useSearchParams()

  const { cart, deliveryPrice, setDeliveryPrice } = useCart()
  const { appliedCoupon } = useCouponStore()

  const pickup = searchParams.get('pickup') as OrderTypeEnum
  const paymentType = searchParams.get('payment') as PaymentTypeEnum
  const changeValue = searchParams.get('changeValue') ?? '0'
  const storeSlug = params?.store_slug as string

  const isDelivery = pickup === 'DELIVERY'

  // Queries
  useReadCart({ subdomain: storeSlug })

  const { data: storeIdData, isPending: isStoreIdPending } = useReadStoreId({
    storeSlug,
  })
  const { data: customerData, isPending: isCustomerPending } = useReadCustomer({
    subdomain: storeSlug,
  })
  const { data: shippingsData, isPending: isShippingsPending } =
    useReadStoreShippings({ subdomain: storeSlug })
  const { data: storeCustomerData, isPending: isStoreCustomerPending } =
    useReadStoreCustomer({
      customerId: customerData?.customer.id,
      storeId: storeIdData?.storeId,
    })
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder()

  // Derived data
  const customer = customerData?.customer
  const storeCustomer = storeCustomerData?.storeCustomer
  const storeId = storeIdData?.storeId
  const customerAddress = customer?.address as CustomerAddress
  const deliveryTime = shippingsData?.storeShippings.delivery_time ?? 0
  const takeoutTime = shippingsData?.storeShippings.pickup_time ?? 0
  const shippingPrice = shippingsData?.storeShippings.price ?? 0
  const cartSessionId = cart && cart.length > 0 ? cart[0].session_id : undefined

  // Calculations
  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  )

  const subtotal = useMemo(
    () =>
      cart.reduce((total, item) => {
        const itemTotal = item.product_price
        const extrasTotal =
          item.extras?.reduce(
            (total, extra) => total + extra.price * extra.quantity,
            0,
          ) || 0
        return total + (itemTotal + extrasTotal) * item.quantity
      }, 0),
    [cart],
  )

  const discount = appliedCoupon?.discount ?? 0
  const totalPrice = useMemo(
    () => subtotal - discount + (isDelivery ? deliveryPrice : 0),
    [subtotal, discount, isDelivery, deliveryPrice],
  )

  // Loading states
  const isLoading =
    isStoreIdPending ||
    isCustomerPending ||
    isShippingsPending ||
    isCreatingOrder ||
    isStoreCustomerPending

  // Effects
  useEffect(() => {
    if (isDelivery) {
      setDeliveryPrice(shippingPrice)
    }
  }, [shippingPrice, isDelivery, setDeliveryPrice])

  // Actions
  const handleCreateOrder = useCallback(async () => {
    if (isCreatingOrder || !cartSessionId || !storeCustomer?.id || !storeId)
      return

    const newOrderData: CreateOrder = {
      cart_session_id: cartSessionId,
      store_subdomain: storeSlug,
      customer_id: storeCustomer.id,
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
  }, [
    isCreatingOrder,
    cartSessionId,
    storeCustomer?.id,
    storeId,
    storeSlug,
    pickup,
    paymentType,
    cart,
    isDelivery,
    deliveryTime,
    takeoutTime,
    customerAddress,
    appliedCoupon?.coupon_id,
    appliedCoupon?.code,
    subtotal,
    discount,
    deliveryPrice,
    totalPrice,
    changeValue,
    createOrder,
  ])

  return {
    // Data
    cart,
    customer: customerData?.customer,
    storeSlug,
    totalItems,
    subtotal,
    discount,
    deliveryPrice,
    totalPrice,
    appliedCoupon,
    isDelivery,

    // States
    isLoading,
    isCreatingOrder,

    // Actions
    handleCreateOrder,
  }
}
