import { Button } from '@/components/ui/button'
import { formatCurrencyBRL } from '@/lib/utils'
import { ExtraType } from '@/models/extras'
import { Minus, Plus } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import { SelectedExtraType } from './add-to-cart'

type ExtrasSectionProps = {
  extras: ExtraType[]
  selectedExtrasState: [
    SelectedExtraType[],
    Dispatch<SetStateAction<SelectedExtraType[]>>,
  ]
}

export function ExtrasSection({
  extras,
  selectedExtrasState,
}: ExtrasSectionProps) {
  const [selectedExtras, setSelectedExtras] = selectedExtrasState

  function increase(extraId: string) {
    setSelectedExtras((prev) =>
      prev.map((extra) =>
        extra.extra_id === extraId
          ? { ...extra, quantity: extra.quantity + 1 }
          : extra,
      ),
    )
  }

  function decrease(extraId: string) {
    setSelectedExtras((prev) =>
      prev.map((extra) =>
        extra.extra_id === extraId
          ? { ...extra, quantity: extra.quantity - 1 }
          : extra,
      ),
    )
  }

  return (
    <section>
      <h2 className="text-lg font-bold">Adicionais</h2>

      {selectedExtras.map((extra) => (
        <div
          key={extra.extra_id}
          className="flex flex-row items-center justify-between border-b last:border-0 py-2"
        >
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              {extras.find((e) => e.id === extra.extra_id)?.name}
            </span>
            <strong className="text-sm">
              {formatCurrencyBRL(
                extra.quantity > 1
                  ? (extras.find((e) => e.id === extra.extra_id)?.price ?? 1) *
                      extra.quantity
                  : (extras.find((e) => e.id === extra.extra_id)?.price ?? 1),
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
