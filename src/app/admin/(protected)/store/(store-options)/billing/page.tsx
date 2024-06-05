import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createStripeAccountLink, getConnectedAccount } from './actions'

export default async function PaymentMethodsPage() {
  const connectedAccount = await getConnectedAccount()

  const account = connectedAccount?.data[0]
  console.log(connectedAccount?.data)

  return (
    <section>
      <Header title="Pagamentos" />

      <Card className="p-4">
        {connectedAccount && connectedAccount.data.length > 0 ? (
          <div>
            <strong>Conta de saque conectada</strong>
            {/* <p>{account?.bank_name}</p> */}
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
