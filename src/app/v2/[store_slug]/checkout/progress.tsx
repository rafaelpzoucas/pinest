// app/checkout/components/CheckoutProgress.tsx
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface CheckoutProgressProps {
  currentStep: number
  totalSteps: number
}

const stepLabels = ['Entrega', 'Pagamento', 'Resumo']

export function CheckoutProgress({
  currentStep,
  totalSteps,
}: CheckoutProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center">
              <div
                className={cn(
                  `w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors`,
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>

              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 transition-colors',
                    index < currentStep ? 'bg-primary' : 'bg-muted',
                  )}
                />
              )}
            </div>

            <span className="text-xs mt-2 font-medium">
              {stepLabels[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
