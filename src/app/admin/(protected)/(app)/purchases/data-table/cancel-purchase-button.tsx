'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { statuses } from '@/models/statuses'
import { X, XCircle } from 'lucide-react'
import { cancelPurchase, updatePurchaseStatus } from '../[id]/actions'

type StatusKey = keyof typeof statuses

export function CancelPurchaseButton({
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
      await cancelPurchase(purchaseId)

      return
    }

    await updatePurchaseStatus(newStatus, purchaseId)
  }

  if (accepted) {
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
            <X className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Recusar/cancelar pedido</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
