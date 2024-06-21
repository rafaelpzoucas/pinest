'use client'

import { Header } from '@/components/header'
import { useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'

const titles: Record<string, string> = {
  pickup: 'Forma de entrega',
  summary: 'Confirme sua compra',
}

interface CheckoutLayoutProps {
  pickup: ReactNode
  summary: ReactNode
  children: ReactNode
}

export default function CheckoutLayout({
  pickup,
  summary,
  children,
}: CheckoutLayoutProps) {
  const searchParams = useSearchParams()

  const step = searchParams.get('step') ?? ''

  const pageTitle = titles[step] ?? 'Finalizar compra'

  return (
    <section className="flex flex-col items-center gap-4 p-4">
      <Header title={pageTitle} />

      {step === 'pickup' && pickup}
      {step === 'summary' && summary}
      {children}
    </section>
  )
}
