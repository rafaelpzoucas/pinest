'use client'

import { useSearchParams } from 'next/navigation'
import { useCheckoutFlow } from '../../checkout/hooks'
import { useBottomAction } from '../hooks'
import { useFinishOrder } from './hooks'
import { OrderActions } from './order-actions'
import { OrderSummary } from './order-summary'

export function FinishOrder() {
  const searchParams = useSearchParams()
  const { config } = useBottomAction()
  const { isLastStep } = useCheckoutFlow()

  const {
    cart,
    customer,
    storeSlug,
    totalItems,
    subtotal,
    discount,
    deliveryPrice,
    appliedCoupon,
    isDelivery,
    isLoading,
    isCreatingOrder,
    handleCreateOrder,
  } = useFinishOrder()

  const isInCheckout = !!searchParams.get('step')
  const isVisible = !!config.showFinishOrder && cart.length > 0

  return (
    <div
      className="flex flex-col translate-y-full absolute opacity-0
        data-[visible=true]:translate-y-0 data-[visible=true]:static
        data-[visible=true]:opacity-100 transition-all duration-200 z-30"
      data-visible={isVisible}
    >
      <div className="p-3">
        <OrderSummary
          totalItems={totalItems}
          subtotal={subtotal}
          discount={discount}
          deliveryPrice={deliveryPrice}
          isDelivery={isDelivery}
          appliedCouponCode={appliedCoupon?.code}
          isLoading={isLoading}
        />
      </div>

      <OrderActions
        isInCheckout={isInCheckout}
        isLastStep={isLastStep}
        isCreatingOrder={isCreatingOrder}
        isLoading={isLoading}
        storeSlug={storeSlug}
        hasCustomer={!!customer}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  )
}
