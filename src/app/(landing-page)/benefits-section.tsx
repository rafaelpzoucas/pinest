import { CheckCircle, Rocket, Timer } from 'lucide-react'

export function BenefitsSection() {
  const benefits = [
    {
      icon: Timer,
      title: 'Atenda pedidos mais rápido',
      description:
        'Comanda impressa, pedidos organizados e integração com iFood garantem que seu restaurante funcione com mais eficiência e menos erros.',
    },
    {
      icon: CheckCircle,
      title: 'Facilidade na gestão do seu restaurante',
      description:
        'Gerencie mesas, pedidos, entregas e pagamentos em um único lugar. O painel intuitivo da Pinest permite que você foque no que realmente importa: oferecer um ótimo serviço aos seus clientes.',
    },
    {
      icon: Rocket,
      title: 'Comece a vender no mesmo dia',
      description:
        'Configure seu cardápio digital em minutos e comece a receber pedidos rapidamente, seja para salão, retirada ou delivery.',
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
