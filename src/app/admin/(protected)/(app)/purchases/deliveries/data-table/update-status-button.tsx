'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildReceiptDeliveryText,
  buildReceiptKitchenText,
} from '@/lib/receipts'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { Check, FastForward, Loader2 } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { acceptPurchase, updatePurchaseStatus } from '../[id]/actions'

type StatusKey = keyof typeof statuses

async function sendToPrint(purchase: PurchaseType, reprint = false) {
  const kitchenPrint = buildReceiptKitchenText(purchase, reprint)
  const deliveryPrint = buildReceiptDeliveryText(purchase, reprint)

  const kitchenBody = JSON.stringify({
    text: kitchenPrint,
    printerName: 'G250',
  })

  const deliveryBody = JSON.stringify({
    text: deliveryPrint,
    printerName: 'G250',
  })

  await fetch('/api/v1/admin/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: kitchenBody,
  })

  await fetch('/api/v1/admin/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: deliveryBody,
  })
}

export function UpdateStatusButton({ purchase }: { purchase: PurchaseType }) {
  const purchaseId = purchase.id
  const currentStatus = purchase.status
  const isIfood = purchase.is_ifood
  const type = purchase.type

  const accepted = currentStatus !== 'accept'

  const { execute: executeAccept, isPending: isAcceptPending } =
    useServerAction(acceptPurchase, {
      onSuccess: () => {
        sendToPrint(purchase)
      },
    })

  const { execute, isPending } = useServerAction(updatePurchaseStatus, {
    onSuccess: () => {
      console.log('Status updated.')
    },
  })

  async function handleUpdateStatus(status: string) {
    if (!accepted) {
      await executeAccept({ purchaseId })
    }

    const newStatus =
      status === 'shipped' && type === 'TAKEOUT' ? 'readyToPickup' : status

    await execute({ newStatus, purchaseId, isIfood })
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
              <Check className="w-5 h-5" />
            ) : isPending || isAcceptPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FastForward className="w-5 h-5" />
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
