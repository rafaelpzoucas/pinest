'use client'

import { createPath } from '@/utils/createPath'
import { ArrowRight, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'
import { useStoreStatus } from '../../(status)/hooks'

interface OrderActionsProps {
  isInCheckout: boolean
  isLastStep: boolean
  isCreatingOrder: boolean
  isLoading: boolean
  storeSlug: string
  hasCustomer: boolean
  onCreateOrder: () => void
}

export const OrderActions = memo(function OrderActions({
  isInCheckout,
  isLastStep,
  isCreatingOrder,
  isLoading,
  storeSlug,
  hasCustomer,
  onCreateOrder,
}: OrderActionsProps) {
  const { status } = useStoreStatus()

  const finishOrderLink = !hasCustomer
    ? createPath('/account?checkout=true', storeSlug)
    : createPath('/checkout?step=pickup', storeSlug)

  return (
    <div className="bg-background">
      {!isInCheckout && !isLastStep && (
        <Link
          href={finishOrderLink}
          className="flex flex-row items-center justify-between w-full max-w-md h-[68px] bg-primary
            text-primary-foreground p-4 font-bold uppercase hover:opacity-80
            active:scale-[0.98] transition-all duration-75 aria-[disabled=true]:opacity-50"
          aria-disabled={!status.isOpen}
        >
          <span>Forma de entrega</span>
          <ArrowRight />
        </Link>
      )}

      {isInCheckout && isLastStep && (
        <button
          onClick={onCreateOrder}
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
  )
})
