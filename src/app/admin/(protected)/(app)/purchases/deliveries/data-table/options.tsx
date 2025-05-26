'use client'

import { Button, buttonVariants } from '@/components/ui/button'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCashRegister } from '@/stores/cashRegisterStore'
import { BadgeDollarSign, Edit, Loader2, Printer } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { closeBills } from '../../close/actions'
import { CancelPurchaseButton } from './cancel-purchase-button'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({
  purchaseId,
  currentStatus,
  type,
  isDetailsPage,
  isIfood,
}: {
  purchaseId: string
  currentStatus: string
  type: string
  isDetailsPage?: boolean
  isIfood: boolean
}) {
  const searchParams = useSearchParams()
  const { isCashOpen } = useCashRegister()

  const tab = searchParams.get('tab')

  const accepted = currentStatus !== 'accept'
  const delivered = currentStatus === 'delivered'

  const { execute: executeCloseBill, isPending: isCloseBillPending } =
    useServerAction(closeBills)

  return (
    <>
      <div className="hidden lg:flex flex-row justify-end">
        {accepted && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={`purchases/deliveries/register?purchase_id=${purchaseId}`}
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

        <UpdateStatusButton
          accepted={accepted}
          currentStatus={currentStatus}
          purchaseId={purchaseId}
          type={type}
          isIfood={isIfood}
        />

        {accepted && delivered && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                {isIfood ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      executeCloseBill({ purchase_id: purchaseId })
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
                        ? `/admin/purchases/close?purchase_id=${purchaseId}&tab=${tab}`
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
                <Link
                  href={`/admin/purchases/deliveries/${purchaseId}/receipt?reprint=true`}
                  target="_blank"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  })}
                >
                  <Printer className="w-5 h-5" />
                </Link>
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
            purchaseId={purchaseId}
            isIfood={isIfood}
          />
        )}
      </div>
    </>
  )
}
