import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, CheckCircle } from 'lucide-react'

export function FirstSteps() {
  const progress = 33

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
        <Button
          variant={'outline'}
          className="flex flex-row items-center text-muted-foreground line-through w-full"
        >
          Informações básicas da loja{' '}
          <CheckCircle className="w-4 h-4 ml-auto" />
        </Button>
        <Button
          variant={'outline'}
          className="flex flex-row items-center text-muted-foreground w-full"
        >
          Cadastrar produtos <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
        <Button
          variant={'outline'}
          className="flex flex-row items-center text-muted-foreground w-full"
        >
          Formas de pagamento <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </CardContent>
    </Card>
  )
}
