'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyBRL } from '@/lib/utils'
import { useMemo } from 'react'

interface OrderSummaryProps {
  totalItems: number
  subtotal: number
  discount: number
  deliveryPrice: number
  isDelivery: boolean
  appliedCouponCode?: string
  isLoading?: boolean
}

export function OrderSummary({
  totalItems,
  subtotal,
  discount,
  deliveryPrice,
  isDelivery,
  appliedCouponCode,
  isLoading,
}: OrderSummaryProps) {
  const totalPrice = useMemo(
    () => subtotal - discount + (isDelivery ? deliveryPrice : 0),
    [subtotal, discount, isDelivery, deliveryPrice],
  )

  return (
    <Card className="p-4 w-full space-y-3">
      <div className="flex flex-row justify-between text-xs text-muted-foreground">
        <p>Produtos {totalItems ? `(${totalItems})` : null}</p>
        <span>
          {subtotal && !isLoading ? (
            formatCurrencyBRL(subtotal)
          ) : (
            <Skeleton className="h-3 w-16" />
          )}
        </span>
      </div>

      {appliedCouponCode && discount > 0 && (
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>Desconto (cupom)</p>
          <span className="text-emerald-500">
            {formatCurrencyBRL(discount * -1)}
          </span>
        </div>
      )}

      {isDelivery && (
        <div className="flex flex-row justify-between text-xs text-muted-foreground">
          <p>Entrega</p>
          <span>
            {deliveryPrice && !isLoading ? (
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
          {totalPrice && !isLoading ? (
            formatCurrencyBRL(totalPrice)
          ) : (
            <Skeleton className="h-[18px] w-24" />
          )}
        </strong>
      </div>
    </Card>
  )
}
