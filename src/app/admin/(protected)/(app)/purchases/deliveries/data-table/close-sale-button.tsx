'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { PurchaseType } from '@/models/purchase'
import { useCashRegister } from '@/stores/cashRegisterStore'
import { BadgeDollarSign, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useServerAction } from 'zsa-react'
import { closeBills } from '../../close/actions'

export function CloseSaleButton({ purchase }: { purchase: PurchaseType }) {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')

  const currentStatus = purchase?.status
  const isIfood = purchase?.is_ifood

  const accepted = currentStatus !== 'accept'
  const delivered = currentStatus === 'delivered'
  const isPaid = purchase.is_paid

  const { isCashOpen } = useCashRegister()

  console.log(isCashOpen)

  const { execute: executeCloseBill, isPending: isCloseBillPending } =
    useServerAction(closeBills)

  if (!accepted || !delivered || isPaid) {
    return null
  }

  if (isIfood) {
    return (
      <Button
        variant="secondary"
        onClick={() => executeCloseBill({ purchase_id: purchase.id })}
      >
        {isCloseBillPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fechando...</span>
          </>
        ) : (
          <>
            <BadgeDollarSign className="w-5 h-5" />
            <span>Fechar venda</span>
          </>
        )}
      </Button>
    )
  }

  return (
    <Link
      href={
        isCashOpen
          ? `/admin/purchases/close?purchase_id=${purchase.id}&tab=${tab}`
          : '/admin/cash-register'
      }
      className={buttonVariants({
        variant: 'secondary',
      })}
    >
      <BadgeDollarSign className="w-5 h-5" />
      <span>Fechar venda</span>
    </Link>
  )
}
