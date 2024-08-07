import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createStripeAccountLink, getConnectedAccount } from './actions'

export default async function PaymentMethodsPage() {
  const connectedAccount = await getConnectedAccount()

  return (
    <section>
      <Header title="Pagamentos" />

      <Card className="p-4">
        {connectedAccount && connectedAccount === 'connected' ? (
          <div>
            <strong>Conta de saque conectada</strong>
          </div>
        ) : (
          <div className="flex flex-col">
            <p>
              Você precisa cadastrar uma conta bancária para poder resgatar suas
              vendas.
            </p>
            <form action={createStripeAccountLink}>
              <Button type="submit">Cadastrar conta bancária</Button>
            </form>
          </div>
        )}
      </Card>
    </section>
  )
}
