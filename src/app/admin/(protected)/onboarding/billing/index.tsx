import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { getConnectedAccount } from '../../(app)/config/(options)/billing/actions'
import { onboardingCreateStripeAccountLink } from './actions'

export async function PaymentStep() {
  const connectedAccount = await getConnectedAccount()

  const isConnected = connectedAccount && connectedAccount === 'connected'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Conta bancária</h1>

      {isConnected ? (
        <>
          <p>Conta bancária conectada!</p>

          <div className="flex flex-row gap-2 w-full">
            <Link href="?step=4" className={cn(buttonVariants(), 'w-full')}>
              Próximo passo
            </Link>
          </div>
        </>
      ) : (
        <>
          <p>
            Para poder resgatar suas vendas, é necessário cadastrar uma conta
            bancária.
          </p>
          <p className="text-muted-foreground text-sm">
            Caso prefira, você pode realizar essa etapa mais tarde na página de
            pagamentos.
          </p>

          <form
            action={onboardingCreateStripeAccountLink}
            className="flex flex-row gap-2 w-full"
          >
            <Link
              href="?step=4"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Pular
            </Link>
            <Button type="submit" className="w-full">
              Cadastrar conta bancária
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
