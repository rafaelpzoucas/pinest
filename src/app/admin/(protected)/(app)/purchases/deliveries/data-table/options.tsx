'use client'

import { buttonVariants } from '@/components/ui/button'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BadgeDollarSign, Eye, Printer } from 'lucide-react'
import Link from 'next/link'
import { CancelPurchaseButton } from './cancel-purchase-button'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({
  accepted,
  purchaseId,
  currentStatus,
  type,
  isDetailsPage,
}: {
  accepted: boolean
  purchaseId: string
  currentStatus: string
  type: string
  isDetailsPage?: boolean
}) {
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
        />

        {accepted && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={`purchases/close?purchase_id=${purchaseId}`}
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                  })}
                >
                  <BadgeDollarSign className="w-5 h-5" />
                </Link>
              </TooltipTrigger>

              <TooltipContent>
                <p>Fechar venda</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {accepted && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={`/admin/purchases/deliveries/${purchaseId}/receipt`}
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
        />
      </div>
    </>
  )
}
