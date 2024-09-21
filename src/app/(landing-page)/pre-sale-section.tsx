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
      name: 'Básico (Pré-venda)',
      price: 'R$ 19/mês (50% de desconto)',
      features: [
        'Acesso antecipado à Pinest',
        'Criação fácil e rápida',
        'Design otimizado para vendas',
        'Suporte básico',
        'Prorrogação do desconto por 6 meses',
      ],
    },
  ]

  return (
    <section className="flex items-center justify-center p-8 py-16">
      <div className="relative z-10 w-full md:max-w-3xl flex flex-col items-center justify-center gap-6 md:gap-16 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-bold text-center">
            Reserve Seu Acesso à Pinest
          </h2>

          <p className="text-center mt-4 text-muted-foreground">
            Aproveite a pré-venda e garanta o plano básico com 50% de desconto!
            Tenha acesso a todas as funcionalidades do MVP e prorrogue esse
            preço por mais 6 meses!
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-center gap-8 mt-8">
          {plans.map((plan) => (
            <Card key={plan.name} className=" ">
              <CardHeader>
                <CardDescription>{plan.name}</CardDescription>
                <CardTitle>{plan.price}</CardTitle>
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
                <Button className="w-full">Começar Agora</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
