'use client'

import { buttonVariants } from '@/components/ui/button'

import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import { CancelPurchaseButton } from './cancel-purchase-button'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({
  accepted,
  purchaseId,
  currentStatus,
}: {
  accepted: boolean
  purchaseId: string
  currentStatus: string
}) {
  return (
    <>
      <div className="hidden lg:flex flex-row">
        <Link
          href={`purchases/${purchaseId}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <SquareArrowOutUpRight className="w-4 h-4" />
        </Link>

        <UpdateStatusButton
          accepted={accepted}
          currentStatus={currentStatus}
          purchaseId={purchaseId}
        />

        <CancelPurchaseButton
          accepted={accepted}
          currentStatus={currentStatus}
          purchaseId={purchaseId}
        />
      </div>
    </>
  )
}
