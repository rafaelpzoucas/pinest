'use client'

import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { OrderType } from '@/models/order'
import { Loader2, Printer } from 'lucide-react'
import { useServerAction } from 'zsa-react'
import { printOrderReceipt } from '../../../config/printing/actions'

export function Printbutton({ order }: { order: OrderType }) {
  const currentStatus = order?.status

  const accepted = currentStatus !== 'accept'

  const isMobile = useIsMobile()

  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printOrderReceipt)

  if (!accepted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size={isMobile ? 'default' : 'icon'}
      onClick={() =>
        executePrintReceipt({
          orderId: order.id,
          orderType: order.type,
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
