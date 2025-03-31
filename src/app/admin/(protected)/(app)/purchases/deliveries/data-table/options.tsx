'use client'

import { buttonVariants } from '@/components/ui/button'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCashRegister } from '@/stores/cashRegisterStore'
import { BadgeDollarSign, Eye, Printer } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CancelPurchaseButton } from './cancel-purchase-button'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({
  accepted,
  purchaseId,
  currentStatus,
  type,
  isDetailsPage,
  isIfood,
}: {
  accepted: boolean
  purchaseId: string
  currentStatus: string
  type: string
  isDetailsPage?: boolean
  isIfood: boolean
}) {
  const searchParams = useSearchParams()
  const { isCashOpen } = useCashRegister()

  const tab = searchParams.get('tab')

  return (
    <>
      <div className="hidden lg:flex flex-row justify-end">
        {accepted && !isDetailsPage && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={`purchases/deliveries/${purchaseId}`}
                  className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                >
                  <Eye className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Detalhes</p>
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

        {accepted && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
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

        <CancelPurchaseButton
          accepted={accepted}
          currentStatus={currentStatus}
          purchaseId={purchaseId}
          isIfood={isIfood}
        />
      </div>
    </>
  )
}
