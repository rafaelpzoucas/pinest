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
      title: 'Crie sua loja virtual em minutos',
      description:
        'Construa sua loja virtual de forma rápida e intuitiva, sem precisar de habilidades técnicas ou complicações. O processo é simples e direto, permitindo que você comece a vender rapidamente.',
    },
    {
      icon: Paintbrush,
      title: 'Design pronto e otimizado para vendas',
      description:
        'Aproveite um visual profissional e moderno, projetado para maximizar a conversão de visitantes em clientes. Não precisa se preocupar com o design - tudo já vem perfeito para impulsionar suas vendas.',
    },
    {
      icon: CircleDollarSign,
      title: 'Receba pagamentos de forma fácil e segura',
      description:
        'Integre sua loja diretamente com o Stripe e ofereça diversas formas de pagamento aos seus clientes, sem complicações técnicas.',
    },
    {
      icon: Truck,
      title: 'Ofereça opções de envio integradas',
      description:
        'Facilite o envio de seus produtos com integrações diretas a transportadoras confiáveis. Ofereça aos clientes diferentes opções de frete sem complicações, melhorando sua experiência de compra.',
    },
    {
      icon: Lightbulb,
      title: 'Venda produtos físicos ou digitais',
      description:
        'Com a Pinest, você pode vender tanto produtos físicos quanto digitais, ampliando suas oportunidades de negócio de forma fácil e eficiente.',
    },
  ]

  return (
    <section className="flex items-center justify-center p-8 py-16 min-h-dvh">
      <div
        className="relative z-10 w-full md:max-w-5xl flex flex-col items-center justify-center
          gap-6 md:gap-16 text-center md:text-left"
      >
        <h1 className="text-5xl font-bold">Principais recursos</h1>

        {resources.map((resource) => (
          <div
            key={resource.title}
            className="flex flex-col items-center md:items-start md:flex-row gap-8 py-16"
          >
            <resource.icon className="w-16 h-16" />
            <div className="flex flex-col gap-4">
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
