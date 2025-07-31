'use client'

import { Button } from '@/components/ui/button'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { useCouponStore } from '@/stores/couponStore'
import { BadgeCheck, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServerAction } from 'zsa-react'
import { validateCoupon } from './actions'

export function CouponField() {
  const { appliedCoupon, setAppliedCoupon } = useCouponStore()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const { execute } = useServerAction(validateCoupon, {
    onSuccess: ({ data }) => {
      if (data?.valid) {
        toast.success('Cupom aplicado com sucesso!')

        setAppliedCoupon(data)
      } else {
        toast.error(data?.error || 'Cupom inválido.')

        setAppliedCoupon(null)
      }
    },
    onError: ({ err }) => {
      toast.error(err?.message || 'Erro ao validar cupom.')

      setAppliedCoupon(null)
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await execute({ code })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col items-center gap-2 text-center border-b py-6 space-y-4">
      <h2 className="font-bold">Possui cupom de desconto?</h2>

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
                disabled={loading}
                className="bg-transparent w-full text-center uppercase outline-none"
              />

              <Button type="submit" disabled={loading || !code}>
                {loading ? (
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
