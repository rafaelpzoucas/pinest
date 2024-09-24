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

export function PreSaleSection() {
  const plans = [
    {
      name: 'Básico (Oferta Limitada)',
      price: 'R$ 38/mês',
      discount_price: 'R$ 19/mês (50% de desconto)',
      features: [
        'Acesso antecipado à Plataforma',
        'Criação fácil e rápida',
        'Design otimizado para vendas',
        'Preço especial por 6 meses',
      ],
    },
  ]

  return (
    <section className="flex items-center justify-center p-8 py-16">
      <div className="relative z-10 w-full md:max-w-3xl flex flex-col items-center justify-center gap-6 md:gap-16 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-bold text-center">
            Garanta seu acesso antecipado à Pinest com 50% de desconto
          </h2>

          <p className="text-center mt-4 text-muted-foreground">
            Aproveite esta oferta especial de pré-venda e garanta o plano básico
            da Pinest com 50% de desconto. Tenha acesso a todas as
            funcionalidades essenciais da plataforma e mantenha esse preço
            promocional por 6 meses adicionais.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-center gap-8 mt-8">
          {plans.map((plan) => (
            <Card key={plan.name} className=" ">
              <CardHeader>
                <CardDescription>{plan.name}</CardDescription>

                <div>
                  <CardDescription className="line-through">
                    {plan.price}
                  </CardDescription>
                  <CardTitle>{plan.discount_price}</CardTitle>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex flex-row text-left items-start text-muted-foreground text-sm"
                    >
                      <CheckCircle2 className="w-full max-w-4 h-4 mr-2" />{' '}
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button className="w-full">Garanta Seu Acesso Agora</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
