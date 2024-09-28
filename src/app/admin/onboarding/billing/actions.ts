'use server'

import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { getStripeAccount } from '../../(protected)/config/(options)/billing/actions'

export async function onboardingCreateStripeAccountLink() {
  const { stripeAccount, userError } = await getStripeAccount()

  if (userError) {
    console.error(userError)
  }

  if (stripeAccount) {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.stripe_account_id as string,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding?step=3`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding?step=3`,
      type: 'account_onboarding',
    })

    return redirect(accountLink.url as string)
  }
}
