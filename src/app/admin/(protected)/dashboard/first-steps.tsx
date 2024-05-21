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

type StepsType = {
  name: string
  href: string
  is_checked: boolean
}

const steps: StepsType[] = [
  {
    name: 'Informações básicas da loja',
    href: 'store/profile',
    is_checked: true,
  },
  {
    name: 'Cadastrar produtos',
    href: 'store/catalog',
    is_checked: false,
  },
  {
    name: 'Formas de pagamento',
    href: 'store/payment-methods',
    is_checked: false,
  },
]

function calculateCompletionPercentage(steps: StepsType[]) {
  const totalSteps = steps.length
  const completedSteps = steps.filter((step) => step.is_checked).length
  const percentage = (completedSteps / totalSteps) * 100
  return percentage
}

export function FirstSteps() {
  const progress = calculateCompletionPercentage(steps)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primeiros passos</CardTitle>
        <CardDescription>
          Configure a sua loja para poder começar a vender
        </CardDescription>
        <Progress value={progress} />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={index}
            href={step.href}
            data-checked={step.is_checked}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex flex-row items-center text-muted-foreground w-full data-[checked=true]:text-primary data-[checked=true]:line-through',
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
