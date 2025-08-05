'use client'

import { nofityCustomer } from '@/actions/admin/notifications/actions'
import { Button } from '@/components/ui/button'
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

  const customerPhone = purchase.store_customers.customers.phone

  const { execute: executePrintReceipt } = useServerAction(printPurchaseReceipt)

  const { execute: executeAccept, isPending: isAcceptPending } =
    useServerAction(acceptPurchase, {
      onSuccess: () => {
        executePrintReceipt({
          purchaseId: purchase.id,
          purchaseType: purchase.type,
          reprint: false,
        })

        nofityCustomer({
          title: 'O seu pedido foi aceito!',
          customerPhone,
        })
      },
    })

  const { execute, isPending } = useServerAction(updatePurchaseStatus, {
    onSuccess: () => {
      nofityCustomer({
        title: statuses[currentStatus as StatusKey].next_step as string,
        customerPhone,
      })
    },
  })

  async function handleUpdateStatus(status: string) {
    if (!accepted) {
      await executeAccept({ purchaseId })
      return
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
    <Button
      onClick={() =>
        handleUpdateStatus(
          statuses[currentStatus as StatusKey].next_status as string,
        )
      }
      disabled={isAcceptPending || isPending}
    >
      {!accepted ? (
        <>
          {isAcceptPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Confirmando...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Confirmar</span>
            </>
          )}
        </>
      ) : isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando...</span>
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
  )
}
