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
    products: 3,
    payments: 4,
    shipping: 5,
  }

  return (
    <main className="flex flex-col items-center justify-center pt-8">
      <Stepper
        currentStep={STEPS[params.current_step as keyof typeof STEPS]}
        steps={[
          { label: 'Informações da loja' },
          { label: 'Aparência da loja' },
          { label: 'Cadastro de produtos' },
          { label: 'Configurar pagamentos' },
          { label: 'Configurar envios' },
        ]}
      />

      <div className="w-full md:max-w-2xl h-full mt-20 md:mt-32 px-4">
        {children}
      </div>
    </main>
  )
}
