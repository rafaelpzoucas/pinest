import {
  createStripeAccountLink,
  getConnectedAccount,
  getStripeAccount,
  onboardingCreateStripeAccountLink,
} from '@/app/admin/(protected)/(app)/config/(options)/billing/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { stripe } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Payments() {
  const connectedAccount = await getConnectedAccount()
  const { stripeAccount } = await getStripeAccount()

  const account = await stripe.accounts.retrieve(
    stripeAccount?.stripe_account_id,
  )

  if (!account.details_submitted) {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount?.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding/payments/stripe`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding/payments/stripe`,
      type: 'account_onboarding',
    })

    return redirect(accountLink.url)
  }

  const loginLink = await stripe.accounts.createLoginLink(
    stripeAccount?.stripe_account_id,
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Conta bancária</h1>

      {connectedAccount && connectedAccount === 'connected' ? (
        <>
          <p>Conta de saque conectada</p>

          <div className="flex flex-row gap-2 w-full">
            <Link
              href={loginLink.url}
              target="_blank"
              className={buttonVariants({ variant: 'outline' })}
            >
              Acessar dashboard
            </Link>

            <Link
              href="/admin/onboarding/shipping/own"
              className={cn(buttonVariants())}
            >
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
            <form action={createStripeAccountLink}>
              <Button type="submit">Cadastrar conta bancária</Button>
            </form>
          </form>
        </>
      )}
    </div>
  )
}
