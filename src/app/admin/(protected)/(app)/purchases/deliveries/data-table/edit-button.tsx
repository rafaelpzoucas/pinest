'use client'

import { buttonVariants } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { PurchaseType } from '@/models/purchase'
import { Edit } from 'lucide-react'
import Link from 'next/link'

export function EditButton({ purchase }: { purchase: PurchaseType }) {
  const isMobile = useIsMobile()

  const currentStatus = purchase?.status

  const accepted = currentStatus !== 'accept'
  const isPaid = purchase.is_paid

  return (
    <>
      {accepted && !isPaid && (
        <Link
          href={`/admin/purchases/deliveries/register?purchase_id=${purchase?.id}`}
          className={buttonVariants({
            variant: 'ghost',
            size: isMobile ? 'default' : 'icon',
          })}
        >
          <Edit className="w-5 h-5" />
          {isMobile && 'Editar'}
        </Link>
      )}
    </>
  )
}
