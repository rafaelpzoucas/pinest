'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { statuses } from '@/models/statuses'
import { FastForward } from 'lucide-react'
import { updatePurchaseStatus } from '../[id]/actions'

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
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleUpdateStatus(
                statuses[currentStatus as StatusKey].next_status as string,
              )
            }
          >
            <FastForward className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{statuses[currentStatus as StatusKey].action_text as string}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
