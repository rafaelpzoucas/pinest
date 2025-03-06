'use client'

import { buttonVariants } from '@/components/ui/button'

import { Eye, Printer } from 'lucide-react'
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
      <div className="hidden lg:flex flex-row justify-end">
        {accepted && (
          <Link
            href={`purchases/${purchaseId}`}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Eye className="w-5 h-5" />
          </Link>
        )}

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

        {accepted && (
          <Link
            href={`purchases/${purchaseId}/print`}
            target="_blank"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Printer className="w-5 h-5" />
          </Link>
        )}
      </div>
    </>
  )
}
