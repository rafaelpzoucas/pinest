import {
  CircleDollarSign,
  Lightbulb,
  Paintbrush,
  Sparkle,
  Truck,
} from 'lucide-react'

export function ResourcesSection() {
  const resources = [
    {
      icon: Sparkle,
      title: 'Criação fácil e rápida',
      description:
        'Monte sua loja virtual em minutos, sem necessidade de habilidades técnicas ou complicações. O processo é simples, direto e pensado para quem precisa começar a vender rapidamente.',
    },
    {
      icon: Paintbrush,
      title: 'Design pronto e otimizado para vendas',
      description:
        'Visual profissional e moderno, pronto para usar e projetado para maximizar a conversão de visitantes em clientes. Não precisa se preocupar com o visual — ele já vem perfeito para vender.',
    },
    {
      icon: CircleDollarSign,
      title: 'Integração com Stripe para pagamentos',
      description:
        'Receba pagamentos de maneira fácil e segura com a integração automática com o Stripe. Aceite diversas formas de pagamento sem complicações técnicas.',
    },
    {
      icon: Truck,
      title: 'Opções de envio integradas',
      description:
        'Facilite o envio de seus produtos com integrações diretas a transportadoras confiáveis. Ofereça aos clientes diferentes opções de frete sem complicações.',
    },
    {
      icon: Lightbulb,
      title: 'Venda produtos físicos ou digitais',
      description:
        'Com a Pinest, você pode vender tanto produtos físicos quanto digitais, ampliando suas oportunidades de mercado de forma fácil e eficiente.',
    },
  ]

  return (
    <section className="flex items-center justify-center p-8 py-16 min-h-dvh">
      <div className="relative z-10 w-full md:max-w-5xl flex flex-col items-center justify-center gap-6 md:gap-16 text-center md:text-left">
        <h1 className="text-5xl font-bold">Principais recursos</h1>

        {resources.map((resource) => (
          <div
            key={resource.title}
            className="flex flex-col items-center md:items-start md:flex-row gap-8 py-16"
          >
            <resource.icon className="w-16 h-16" />
            <div className="flex flex-col gap-4 ">
              <h3 className="text-xl md:text-2xl font-bold text-primary max-w-2xl">
                {resource.title}
              </h3>

              <p className="max-w-2xl text-muted-foreground">
                {resource.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
