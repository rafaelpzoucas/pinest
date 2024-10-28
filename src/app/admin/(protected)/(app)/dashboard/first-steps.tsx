import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { readProductsByStore } from '../catalog/products/actions'
import { readUser } from '../config/(options)/account/actions'
import { getConnectedAccount } from '../config/(options)/billing/actions'
import { readOwnShipping } from '../config/(options)/shipping/own-shipping/actions'

type StepsType = {
  name: string
  href: string
  is_checked: boolean
}

function calculateCompletionPercentage(steps: StepsType[]) {
  const totalSteps = steps.length
  const completedSteps = steps.filter((step) => step.is_checked).length
  const percentage = (completedSteps / totalSteps) * 100
  return percentage
}

export async function FirstSteps() {
  const { data: user } = await readUser()
  const { data: products } = await readProductsByStore(user?.stores[0].id)
  const { shipping } = await readOwnShipping()
  const connectedAccount = await getConnectedAccount()

  const steps: StepsType[] = [
    {
      name: 'Informações básicas da loja',
      href: '/admin/onboarding?step=store&info=name',
      is_checked: user !== null ?? false,
    },
    {
      name: 'Cadastrar produtos',
      href: 'catalog',
      is_checked: (products && products.length > 0) ?? false,
    },
    {
      name: 'Formas de pagamento',
      href: 'config/billing',
      is_checked:
        (connectedAccount && connectedAccount === 'connected') ?? false,
    },
    {
      name: 'Formas de envio',
      href: 'config/shipping',
      is_checked: shipping ?? false,
    },
  ]
  const progress = calculateCompletionPercentage(steps)

  if (progress === 100) return null

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Primeiros passos</CardTitle>
        <CardDescription>
          Configure a sua loja para poder começar a vender
        </CardDescription>
        <Progress value={progress} />
        <span className="text-primary text-xs ml-auto">{progress}%</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={index}
            href={step.href}
            data-checked={step.is_checked}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              `flex flex-row items-center text-muted-foreground w-full
              data-[checked=true]:text-primary data-[checked=true]:line-through`,
            )}
          >
            {step.name}{' '}
            {step.is_checked ? (
              <CheckCircle className="w-4 h-4 ml-auto" />
            ) : (
              <ArrowRight className="w-4 h-4 ml-auto" />
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
