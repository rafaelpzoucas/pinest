import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { createStripeCheckout } from '../../checkout/actions'
import { RealtimeStatus } from './realtime-status'

export type StatusKey = keyof typeof statuses

export function Status({
  purchase,
  storeName,
}: {
  purchase: PurchaseType
  storeName: string
}) {
  async function handleCreateStripeCheckout() {
    'use server'
    await createStripeCheckout(storeName, purchase.id)
  }

  return (
    <RealtimeStatus
      purchase={purchase}
      createStripeCheckout={handleCreateStripeCheckout}
    />
  )
}
