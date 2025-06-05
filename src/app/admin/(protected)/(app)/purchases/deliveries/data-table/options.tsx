'use client'

import { Button, buttonVariants } from '@/components/ui/button'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PurchaseType } from '@/models/purchase'
import { useCashRegister } from '@/stores/cashRegisterStore'
import { BadgeDollarSign, Edit, Loader2, Printer } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { printPurchaseReceipt } from '../../../config/printing/actions'
import { closeBills } from '../../close/actions'
import { CancelPurchaseButton } from './cancel-purchase-button'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({ purchase }: { purchase: PurchaseType }) {
  const searchParams = useSearchParams()
  const { isCashOpen } = useCashRegister()

  const tab = searchParams.get('tab')

  const currentStatus = purchase?.status
  const isIfood = purchase?.is_ifood

  const accepted = currentStatus !== 'accept'
  const delivered = currentStatus === 'delivered'
  const isPaid = purchase.is_paid

  const { execute: executeCloseBill, isPending: isCloseBillPending } =
    useServerAction(closeBills)
  const { execute: executePrintReceipt, isPending: isPrinting } =
    useServerAction(printPurchaseReceipt)

  return (
    <>
      <div className="hidden lg:flex flex-row justify-end">
        {accepted && !isPaid && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={`purchases/deliveries/register?purchase_id=${purchase?.id}`}
                  className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                >
                  <Edit className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar pedido</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <UpdateStatusButton purchase={purchase} />

        {accepted && delivered && !isPaid && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                {isIfood ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      executeCloseBill({ purchase_id: purchase.id })
                    }
                  >
                    {isCloseBillPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <BadgeDollarSign className="w-5 h-5" />
                    )}
                  </Button>
                ) : (
                  <Link
                    href={
                      isCashOpen
                        ? `/admin/purchases/close?purchase_id=${purchase.id}&tab=${tab}`
                        : '/admin/cash-register'
                    }
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon',
                    })}
                  >
                    <BadgeDollarSign className="w-5 h-5" />
                  </Link>
                )}
              </TooltipTrigger>

              <TooltipContent>
                {isCashOpen ? (
                  <p>Fechar venda</p>
                ) : (
                  <div>
                    <strong>Fechar venda</strong>
                    <p>Para fechar a venda, é necessário abrir o caixa.</p>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {accepted && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    executePrintReceipt({
                      printerName: 'G250',
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
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Imprimir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {!delivered && (
          <CancelPurchaseButton
            accepted={accepted}
            currentStatus={currentStatus}
            purchaseId={purchase?.id}
            isIfood={isIfood}
          />
        )}
      </div>
    </>
  )
}
