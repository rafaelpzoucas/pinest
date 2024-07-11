'use client'

import { Button } from '@/components/ui/button'
import { statuses } from '@/models/statuses'
import { updatePurchaseStatus } from './actions'

type StatusKey = keyof typeof statuses

export function UpdateStatusButton({
  currentStatus,
  purchaseId,
}: {
  currentStatus: string
  purchaseId: string
}) {
  async function handleUpdateStatus(newStatus: string) {
    await updatePurchaseStatus(newStatus, purchaseId)
  }

  if (
    currentStatus === 'pending' ||
    currentStatus === 'processing' ||
    currentStatus === 'delivered' ||
    currentStatus === 'cancelled' ||
    currentStatus === 'returned' ||
    currentStatus === 'refunded' ||
    currentStatus === 'payment_failed' ||
    currentStatus === 'awaiting_payment' ||
    currentStatus === 'under_review'
  ) {
    return null
  }

  return (
    <Button
      className="mt-2 w-full"
      onClick={() =>
        handleUpdateStatus(
          statuses[currentStatus as StatusKey].next_status as string,
        )
      }
    >
      {statuses[currentStatus as StatusKey].action_text as string}
    </Button>
  )
}
