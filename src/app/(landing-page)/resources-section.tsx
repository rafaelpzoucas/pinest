import {
  LayoutDashboard,
  Printer,
  RefreshCcw,
  Truck,
  Utensils,
} from 'lucide-react'

export function ResourcesSection() {
  const resources = [
    {
      icon: LayoutDashboard,
      title: 'Gerencie seu restaurante em um só lugar',
      description:
        'Controle pedidos, mesas, entregas e comandas de forma centralizada. Tenha total controle das operações do seu restaurante com um painel intuitivo e fácil de usar.',
    },
    {
      icon: Utensils,
      title: 'Cardápio digital e pedidos online',
      description:
        'Crie um cardápio digital completo e receba pedidos diretamente pelo WhatsApp ou iFood. Personalize seu menu e facilite a escolha dos clientes.',
    },
    {
      icon: Printer,
      title: 'Impressão de comandas',
      description:
        'Automatize a impressão de comandas para cozinha e delivery. Assim, sua equipe trabalha com mais agilidade e eficiência no atendimento.',
    },
    {
      icon: Truck,
      title: 'Gerencie entregas e retiradas',
      description:
        'Organize pedidos para retirada e delivery, garantindo uma experiência fluida tanto para seus clientes quanto para sua equipe de entrega.',
    },
    {
      icon: RefreshCcw,
      title: 'Integração com iFood e outras plataformas',
      description:
        'Sincronize pedidos do iFood automaticamente e gerencie tudo em um único sistema, sem precisar alternar entre diferentes plataformas.',
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
