import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export function PricingSection() {
  const plans = [
    {
      name: 'Básico',
      price: 'R$ 29/mês',
      features: [
        'Criação fácil e rápida',
        'Design otimizado para vendas',
        'Suporte básico',
      ],
    },
    {
      name: 'Profissional',
      price: 'R$ 49/mês',
      features: [
        'Tudo no Básico',
        'Integração com pagamentos',
        'Relatórios e análises',
        'Suporte prioritário',
      ],
    },
    {
      name: 'Premium',
      price: 'R$ 79/mês',
      features: [
        'Tudo no Profissional',
        'Opções de envio integradas',
        'Venda produtos digitais',
        'Suporte 24/7',
      ],
    },
  ]

  return (
    <section id="pricing" className="p-8 py-16">
      <h2 className="text-3xl font-bold text-center">
        Escolha o Plano Perfeito para Sua Loja
      </h2>

      <p className="text-center mt-4 text-muted-foreground">
        Planos flexíveis para atender a todas as suas necessidades de venda
        online.
      </p>

      <div className="flex flex-col md:flex-row md:items-start justify-center gap-8 mt-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.price}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex flex-row items-center text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> {feature}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button className="w-full">Começar Agora</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
