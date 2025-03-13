import { Stepper } from '@/components/stepper'
import { ReactNode } from 'react'

export default function StepsLayout({
  params,
  children,
}: {
  params: { current_step: string }
  children: ReactNode
}) {
  const STEPS = {
    store: 1,
    appearence: 2,
    // payments: 3,
    shipping: 3,
  }

  return (
    <main className="flex flex-col items-center justify-center pt-8">
      <Stepper
        currentStep={STEPS[params.current_step as keyof typeof STEPS]}
        steps={[
          { label: 'Loja' },
          { label: 'Aparência' },
          // { label: 'Pagamentos' },
          { label: 'Entrega' },
        ]}
      />

      <div className="w-full md:max-w-2xl h-full mt-20 md:mt-32">
        {children}
      </div>
    </main>
  )
}
