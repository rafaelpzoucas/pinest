'use client'

import { PickupStep } from './(pickup)/pickup'
import SummaryStep from './(summary)/summary'
import { useCheckoutFlow } from './hooks'
import { PaymentStep } from './payment'

export default function CheckoutPage() {
  const { step } = useCheckoutFlow()

  const renderStep = () => {
    switch (step) {
      case 'pickup':
        return <PickupStep />
      case 'payment':
        return <PaymentStep />
      case 'summary':
        return <SummaryStep />
      default:
        return <PickupStep />
    }
  }

  return (
    <div className="pt-[68px] pb-48 px-4">
      <div className="mt-4">{renderStep()}</div>
    </div>
  )
}
