import { AdminHeader } from '@/app/admin-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  createStripeAccountLink,
  getConnectedAccount,
  getStripeAccount,
} from './actions'

export default async function PaymentMethodsPage() {
  const connectedAccount = await getConnectedAccount()
  const { stripeAccount } = await getStripeAccount()

  const account = await stripe.accounts.retrieve(
    stripeAccount?.stripe_account_id,
  )

  if (!account.details_submitted) {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount?.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/config/billing`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/config/billing`,
      type: 'account_onboarding',
    })

    return redirect(accountLink.url)
  }

  const loginLink = await stripe.accounts.createLoginLink(
    stripeAccount?.stripe_account_id,
  )

  return (
    <section className="space-y-6">
      <AdminHeader title="Pagamentos" />

      <Card className="p-4 max-w-md">
        {connectedAccount && connectedAccount === 'connected' ? (
          <div className="flex flex-col gap-4">
            <strong>Conta de saque conectada</strong>
            <Link
              href={loginLink.url}
              target="_blank"
              className={buttonVariants()}
            >
              Acessar dashboard
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
