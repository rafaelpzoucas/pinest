'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { statuses } from '@/models/statuses'
import { X } from 'lucide-react'
import { cancelPurchase } from '../[id]/actions'

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
  async function handleUpdateStatus() {
    await cancelPurchase(purchaseId)
  }

  if (currentStatus === 'cancelled') {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleUpdateStatus()}
          >
            <X className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{accepted ? 'Cancelar' : 'Recusar'} pedido</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
