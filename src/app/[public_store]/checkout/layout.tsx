'use client'

import { Header } from '@/components/store-header'
import { useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'

const titles: Record<string, string> = {
  pickup: 'Forma de entrega',
  payment: 'Forma de pagamento',
  summary: 'Confirme sua compra',
}

interface CheckoutLayoutProps {
  pickup: ReactNode
  payment: ReactNode
  summary: ReactNode
  children: ReactNode
}

export default function CheckoutLayout({
  pickup,
  payment,
  summary,
  children,
}: CheckoutLayoutProps) {
  const searchParams = useSearchParams()

  const step = searchParams.get('step') ?? ''

  const pageTitle = titles[step] ?? 'Finalizar compra'

  return (
    <section className="flex flex-col items-center gap-4">
      <Header title={pageTitle} />

      <div className="w-full max-w-lg">
        {step === 'pickup' && pickup}
        {step === 'summary' && summary}
        {step === 'payment' && payment}
        {children}
      </div>
    </section>
  )
}
