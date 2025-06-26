'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { Check, FastForward, Loader2 } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { printPurchaseReceipt } from '../../../config/printing/actions'
import { acceptPurchase, updatePurchaseStatus } from '../[id]/actions'

type StatusKey = keyof typeof statuses

export function UpdateStatusButton({ purchase }: { purchase: PurchaseType }) {
  const purchaseId = purchase?.id
  const currentStatus = purchase?.status
  const isIfood = purchase?.is_ifood
  const type = purchase?.type

  const accepted = currentStatus !== 'accept'

  const { execute: executePrintReceipt } = useServerAction(printPurchaseReceipt)

  const { execute: executeAccept, isPending: isAcceptPending } =
    useServerAction(acceptPurchase, {
      onSuccess: () => {
        executePrintReceipt({
          purchaseId: purchase.id,
          reprint: false,
        })
      },
    })

  const { execute, isPending } = useServerAction(updatePurchaseStatus)

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
            variant={!accepted ? 'default' : 'secondary'}
            // size="icon"
            onClick={() =>
              handleUpdateStatus(
                statuses[currentStatus as StatusKey].next_status as string,
              )
            }
          >
            {!accepted ? (
              <>
                <Check className="w-5 h-5" />
                <span>Aceitar pedido</span>
              </>
            ) : isPending || isAcceptPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Carregando</span>
              </>
            ) : (
              <>
                <FastForward className="w-5 h-5" />
                <span>
                  {statuses[currentStatus as StatusKey]?.action_text as string}
                </span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {!accepted
              ? 'Aceitar pedido'
              : (statuses[currentStatus as StatusKey]?.action_text as string)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
