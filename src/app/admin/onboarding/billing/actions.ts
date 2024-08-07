'use server'

import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { getStripeAccount } from '../../(protected)/store/(store-options)/billing/actions'

export async function onboardingCreateStripeAccountLink() {
  const { user, userError } = await getStripeAccount()

  if (userError) {
    console.error(userError)
  }

  if (user) {
    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id as string,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding?step=4`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding?step=4`,
      type: 'account_onboarding',
    })

    return redirect(accountLink.url as string)
  }
}
