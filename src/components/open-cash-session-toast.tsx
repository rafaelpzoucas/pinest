'use client'

import { OpenCashSession } from '@/app/admin/(protected)/(app)/cash-register/open'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from './ui/card'

export function OpenCashSessionToast({
  cashSession,
}: {
  cashSession: boolean
}) {
  const isCashSessionOpen = cashSession !== null

  const [isOpen, setIsOpen] = useState(!isCashSessionOpen)

  useEffect(() => {
    setIsOpen(!isCashSessionOpen)
  }, [cashSession])

  return (
    <Card
      className="hidden lg:block fixed bottom-4 right-4 p-4 bg-secondary opacity-0
        translate-y-full data-[visible=true]:opacity-100
        data-[visible=true]:translate-y-0 transition-all duration-200 ease-in-out"
      data-visible={isOpen}
    >
      <section className="space-y-6">
        <header className="flex flex-row gap-4">
          <p className="max-w-md">
            O caixa ainda não foi aberto. Inicie uma sessão para registrar o
            fluxo de entradas e saídas.
          </p>

          <button className="h-fit" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </header>

        <OpenCashSession />
      </section>
    </Card>
  )
}
