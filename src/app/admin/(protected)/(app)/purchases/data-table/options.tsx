'use client'

import { buttonVariants } from '@/components/ui/button'

import { Edit } from 'lucide-react'
import Link from 'next/link'
import { UpdateStatusButton } from './update-status-button'

export function PurchaseOptions({
  purchaseId,
  currentStatus,
}: {
  purchaseId: string
  currentStatus: string
}) {
  return (
    <>
      <div className="hidden lg:flex flex-row ">
        <Link
          href={`purchases/${purchaseId}`}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
        >
          <Edit className="w-4 h-4" />
        </Link>
        <UpdateStatusButton
          currentStatus={currentStatus}
          purchaseId={purchaseId}
        />
      </div>
    </>
  )
}
