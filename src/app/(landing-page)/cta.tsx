'use client'

import { PreSaleForm } from './form'

export function CTASection() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 bg-secondary/20 p-8 py-16">
      <div className="relative z-10 w-full md:max-w-5xl flex flex-col items-center justify-center text-center gap-6 md:gap-8">
        <h3 className="text-2xl md:text-5xl font-bold text-primary">
          Junte-se à Lista de Espera Exclusiva da Pinest!
        </h3>

        <p className="text-muted-foreground max-w-2xl">
          Seja o primeiro a saber quando o app estiver pronto!
        </p>
      </div>

      <PreSaleForm />
    </section>
  )
}
