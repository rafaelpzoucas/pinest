'use client'

import { Button } from '@/components/ui/button'
import { useValidateCoupon } from '@/features/store/coupons/hooks'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { useCouponStore } from '@/stores/couponStore'
import { BadgeCheck, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export function CouponField() {
  const params = useParams()

  const { appliedCoupon } = useCouponStore()

  const [code, setCode] = useState('')

  const { mutate: validateCoupon, isPending } = useValidateCoupon()

  const storeSlug = params.store_slug as string

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    validateCoupon({ code, storeSlug })
  }

  return (
    <section className="flex flex-col items-center gap-2 text-center">
      <form className="flex flex-col gap-2 mb-4 w-full" onSubmit={handleSubmit}>
        <div
          className={cn(
            `flex gap-2 items-center justify-between mb-4 bg-primary/10 w-full rounded-lg
            border-2 border-dashed border-primary text-center p-2 h-14`,
          )}
        >
          {!appliedCoupon ? (
            <>
              <input
                type="text"
                name="coupon"
                placeholder="insira seu cupom aqui"
                maxLength={20}
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isPending}
                className="bg-transparent w-full text-center uppercase outline-none"
              />

              <Button type="submit" disabled={isPending || !code}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" /> <span>Validando</span>
                  </>
                ) : (
                  'Aplicar'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex flex-row items-center gap-2 uppercase text-primary">
                <BadgeCheck />
                <strong>{appliedCoupon.code}</strong>
              </div>

              <span className="text-sm">
                {appliedCoupon.discount_type === 'percent'
                  ? `${appliedCoupon.discount}%`
                  : `${formatCurrencyBRL(appliedCoupon.discount)}`}{' '}
                de desconto
              </span>
            </>
          )}
        </div>
      </form>
    </section>
  )
}
