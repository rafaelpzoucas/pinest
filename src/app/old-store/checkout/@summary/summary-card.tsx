'use client'

import { Card } from '@/components/ui/card'
import { calculateCartTotal, formatCurrencyBRL } from '@/lib/utils'
import { useCouponStore } from '@/stores/couponStore'
import { CheckoutButton } from './checkout-button'

export function SummaryCard({
  cart,
  shipping,
  shippingCost,
  pickup,
  payment,
  transp,
  totalPrice,
  store,
  searchParams,
}: {
  cart: any
  shipping: any
  shippingCost: string
  pickup: string
  payment: string
  transp: string
  totalPrice: number
  store: any
  searchParams: any
}) {
  const { appliedCoupon } = useCouponStore()

  function getDiscountedTotal() {
    if (!appliedCoupon || !appliedCoupon.valid) return totalPrice
    if (appliedCoupon.discount_type === 'percent') {
      return Math.max(
        0,
        totalPrice - (totalPrice * appliedCoupon.discount) / 100,
      )
    }
    if (appliedCoupon.discount_type === 'fixed') {
      return Math.max(0, totalPrice - appliedCoupon.discount)
    }
    return totalPrice
  }

  const isCouponValid = appliedCoupon?.valid ?? false
  const couponDiscountType = appliedCoupon?.discount_type
  const couponDiscount = appliedCoupon?.discount ?? 0

  const couponDiscountTotal =
    appliedCoupon && isCouponValid
      ? couponDiscountType === 'percent'
        ? (totalPrice * couponDiscount) / -100
        : couponDiscount * -1
      : 0

  const createOrderValues = {
    type: pickup,
    payment_type: payment,
    totalAmount: getDiscountedTotal(),
    discount: couponDiscountTotal,
    shippingPrice:
      pickup === 'DELIVERY'
        ? parseFloat(shippingCost) || (shipping?.price ?? 0)
        : 0,
    shippingTime: shipping && shipping.status ? shipping.delivery_time : 0,
    changeValue: parseFloat(searchParams.changeValue ?? 0),
    ...(appliedCoupon && appliedCoupon.valid
      ? {
          coupon_code: appliedCoupon.code,
          coupon_id: appliedCoupon.coupon_id,
          discount_value: appliedCoupon.discount,
          discount_type: appliedCoupon.discount_type,
        }
      : {}),
  }

  // Calcula o preço dos produtos
  const productsPrice = calculateCartTotal(cart)

  // Calcula o preço do frete
  const shippingPrice =
    pickup === 'DELIVERY'
      ? parseFloat(shippingCost) || (shipping?.price ?? 0)
      : 0

  const total = getDiscountedTotal()

  return (
    <Card className="flex flex-col p-4 w-full space-y-2">
      <div className="flex flex-row justify-between text-xs text-muted-foreground">
        <p>Produtos ({cart ? cart.length : 0})</p>
        <span>{formatCurrencyBRL(productsPrice)}</span>
      </div>

      {appliedCoupon && isCouponValid ? (
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>
            Desconto{' '}
            {couponDiscountType === 'percent' ? `${couponDiscount}%` : ''}
          </p>
          <span>{formatCurrencyBRL(couponDiscountTotal)}</span>
        </div>
      ) : null}

      <div className="flex flex-row justify-between text-xs text-muted-foreground">
        <p>
          {searchParams.pickup !== 'TAKEOUT' ? 'Frete' : 'Retirar'}
          <strong>{transp ? ` por ${transp}` : ''}</strong>
        </p>
        {searchParams.pickup !== 'TAKEOUT' && shipping && (
          <span>{formatCurrencyBRL(shippingPrice)}</span>
        )}
        {searchParams.pickup === 'TAKEOUT' && shipping && (
          <span className="text-emerald-600">Grátis</span>
        )}
      </div>

      <div className="flex flex-row justify-between text-sm pb-2">
        <p>Total</p>
        <strong>{formatCurrencyBRL(total)}</strong>
      </div>
      <CheckoutButton values={createOrderValues} />
    </Card>
  )
}
