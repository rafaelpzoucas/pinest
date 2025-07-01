'use client'

import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { PurchaseType } from '@/models/purchase'
import { Loader2, Printer } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { printPurchaseReceipt } from '../../../config/printing/actions'

export function Printbutton({ purchase }: { purchase: PurchaseType }) {
  const currentStatus = purchase?.status

  const accepted = currentStatus !== 'accept'

  const isMobile = useIsMobile()

  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printPurchaseReceipt)

  if (!accepted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size={isMobile ? 'default' : 'icon'}
      onClick={() =>
        executePrintReceipt({
          purchaseId: purchase.id,
          reprint: true,
        })
      }
      disabled={isPrinting}
    >
      {isPrinting ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Printer className="w-5 h-5" />
      )}

      {isMobile && 'Imprimir'}
    </Button>
  )
}
