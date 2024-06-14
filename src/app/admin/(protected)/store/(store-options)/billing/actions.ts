'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getStripeAccountId() {
  const supabase = createClient()
  const { data: session } = await supabase.auth.getUser()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', session.user?.id)
    .single()

  return { user, userError }
}

export async function getConnectedAccount() {
  const { user, userError } = await getStripeAccountId()

  if (userError) {
    return
  }

  const connectedAccounts = await stripe.accounts.listExternalAccounts(
    user?.stripe_account_id,
  )

  if (!connectedAccounts) {
    return null
  }

  return connectedAccounts
}

export async function createStripeAccountLink() {
  const { user, userError } = await getStripeAccountId()

  if (userError) {
    console.error(userError)
  }

  if (user) {
    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id as string,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/store/billing`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/store/billing`,
      type: 'account_onboarding',
    })

    return redirect(accountLink.url as string)
  }
}
