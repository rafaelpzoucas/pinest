'use client'

import { Button } from '@/components/ui/button'
import { useProductExtras } from '@/features/store/extras/hooks'
import { SelectedExtra } from '@/features/store/extras/schemas'
import { formatCurrencyBRL } from '@/lib/utils'
import { useCart } from '@/stores/cart-store'
import { Minus, Plus } from 'lucide-react'
import { useEffect } from 'react'

type ExtrasSectionProps = {
  storeId?: string
  productId: string
}

export function ExtrasSection({ storeId, productId }: ExtrasSectionProps) {
  const { currentCartItem, setExtras, updateExtraQuantity } = useCart()

  const {
    data: extrasData,
    isLoading,
    error,
    isError,
  } = useProductExtras({
    storeId,
    productId,
  })

  function increase(extraId: string) {
    const extra = currentCartItem.extras.find((e) => e.extra_id === extraId)
    if (extra) {
      updateExtraQuantity(extraId, extra.quantity + 1)
    }
  }

  function decrease(extraId: string) {
    const extra = currentCartItem.extras.find((e) => e.extra_id === extraId)
    if (extra) {
      updateExtraQuantity(extraId, extra.quantity - 1)
    }
  }

  useEffect(() => {
    if (extrasData?.extras) {
      const defaultExtras = extrasData.extras.map((e) => ({
        extra_id: e.id,
        name: e.name,
        price: e.price,
        quantity: 0,
      })) as SelectedExtra[]
      setExtras(defaultExtras)
    }
  }, [extrasData?.extras, setExtras])

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <section className="p-4">
        <div className="h-6 bg-muted animate-pulse rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                <div className="h-4 bg-muted animate-pulse rounded w-16" />
              </div>
              <div className="w-10 h-10 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="p-4">
        <div className="text-destructive text-sm">
          Erro ao carregar adicionais: {error?.message}
        </div>
      </section>
    )
  }

  // Se não há extras, não renderiza nada
  if (!currentCartItem.extras.length) return null

  return (
    <section className="p-4">
      <h2 className="text-lg font-bold">Adicionais</h2>

      {currentCartItem.extras.map((extra) => (
        <div
          key={extra.extra_id}
          className="flex flex-row items-center justify-between border-b last:border-0 py-2"
        >
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{extra?.name}</span>
            <strong className="text-sm">
              {formatCurrencyBRL(
                extra.quantity > 1
                  ? (extra?.price ?? 1) * extra.quantity
                  : (extra?.price ?? 1),
              )}
            </strong>
          </div>
          <div className="flex flex-row items-center gap-3">
            {extra.quantity > 0 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => decrease(extra.extra_id)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-6 text-center">{extra.quantity}</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => increase(extra.extra_id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => increase(extra.extra_id)}
                type="button"
                variant="ghost"
                size="icon"
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}
