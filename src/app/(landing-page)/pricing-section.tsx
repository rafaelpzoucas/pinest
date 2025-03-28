import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createAdminClient } from '@/lib/supabase/admin'
import { cn, formatCurrencyBRL } from '@/lib/utils'
import { FeatureKey, PLANS_FEATURES_MAP } from '@/models/plans'
import { CheckCircle2, Star } from 'lucide-react'

export async function PricingSection() {
  const supabase = createAdminClient()

  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: false })

  if (plansError) {
    console.error('Error fetching plans:', plansError)
    return null
  }

  function getFeatureLabel(key: FeatureKey): string {
    return PLANS_FEATURES_MAP[key]
  }

  return (
    <section id="pricing" className="p-8 py-16">
      <h2 className="text-3xl font-bold text-center">
        Escolha o Plano Perfeito para seu Restaurante
      </h2>

      <p className="text-center mt-4 text-muted-foreground">
        Planos flexíveis para atender a todas as suas necessidades de gestão e
        venda online.
      </p>

      <div className="flex flex-col md:flex-row md:items-start justify-center gap-8 mt-8">
        {plans?.map((plan, index) => (
          <Card
            key={plan.name}
            className={cn(
              'relative w-full max-w-xs',
              index === 0 && 'border-2 border-primary',
            )}
          >
            {index === 0 && (
              <Badge className="absolute top-2 right-2">
                <Star className="w-4 h-4 mr-2" /> Popular
              </Badge>
            )}
            <CardHeader>
              <CardDescription className="text-lg">{plan.name}</CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrencyBRL(plan.price)}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="mt-4 space-y-2">
                {Object.keys(plan.features).map((feature) => {
                  if (!plan.features[feature]) return null
                  return (
                    <li
                      key={feature}
                      className="flex flex-row items-center text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />{' '}
                      {getFeatureLabel(feature as FeatureKey)}
                    </li>
                  )
                })}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={index === 0 ? 'default' : 'secondary'}
              >
                Começar Agora
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
