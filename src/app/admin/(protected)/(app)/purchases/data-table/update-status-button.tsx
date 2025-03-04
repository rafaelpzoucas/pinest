'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { statuses } from '@/models/statuses'
import { CircleCheckBig, FastForward } from 'lucide-react'
import { acceptPurchase, updatePurchaseStatus } from '../[id]/actions'

type StatusKey = keyof typeof statuses

export function UpdateStatusButton({
  accepted,
  currentStatus,
  purchaseId,
}: {
  accepted: boolean
  currentStatus: string
  purchaseId: string
}) {
  async function handleUpdateStatus(newStatus: string) {
    if (!accepted) {
      await acceptPurchase(purchaseId)

      window.open(`/admin/purchases/${purchaseId}/print`, '_blank')
    }

    await updatePurchaseStatus(newStatus, purchaseId)
  }

  if (
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
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleUpdateStatus(
                statuses[currentStatus as StatusKey].next_status as string,
              )
            }
          >
            {!accepted ? (
              <CircleCheckBig className="w-4 h-4" />
            ) : (
              <FastForward className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {!accepted
              ? 'Aceitar pedido'
              : (statuses[currentStatus as StatusKey].action_text as string)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
