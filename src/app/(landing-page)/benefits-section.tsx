import { Rocket, TrendingUp, Wand } from 'lucide-react'

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Poupe tempo valioso',
      description:
        'Com a Pinest, você não perde tempo escolhendo temas ou ajustando a aparência da loja. Tudo já vem pronto, permitindo que você se concentre 100% em vender e impulsionar seus negócios.',
    },
    {
      icon: Wand,
      title: 'Gerenciamento simples e eficiente',
      description:
        'Controle seus produtos e pedidos com facilidade usando um painel intuitivo, sem complicações técnicas. Foque em crescer sua loja, e deixe a Pinest cuidar dos detalhes.',
    },
    {
      icon: Rocket,
      title: 'Inicie suas vendas rapidamente',
      description:
        'Lance sua loja em minutos e comece a vender de imediato, aproveitando uma plataforma pronta para gerar vendas e impulsionar seu negócio.',
    },
  ]

  return (
    <section className="flex items-center justify-center p-8 py-16 min-h-dvh bg-secondary/20">
      <div
        className="relative z-10 w-full md:max-w-5xl flex flex-col items-center justify-center
          gap-6 md:gap-16 text-center md:text-left"
      >
        <h1 className="text-5xl font-bold">Principais benefícios</h1>

        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 py-16"
          >
            <benefit.icon className="w-16 h-16" />
            <div className="flex flex-col gap-4">
              <h3 className="text-xl md:text-2xl font-bold text-primary max-w-2xl">
                {benefit.title}
              </h3>

              <p className="max-w-2xl text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
