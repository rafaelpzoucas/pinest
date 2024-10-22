'use server'

import { createSeller } from '@/app/admin/(protected)/onboarding/actions'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getStripeAccount() {
  const supabase = createClient()
  const { data: session } = await supabase.auth.getUser()

  const { data: stripeAccount, error: userError } = await supabase
    .from('users')
    .select('stripe_account_id, stripe_connected_account')
    .eq('id', session.user?.id)
    .single()

  return { stripeAccount, userError }
}

async function updateStripeConnectedAccount(account: any) {
  const supabase = createClient()
  const { data: session } = await supabase.auth.getUser()

  if (account) {
    const { error } = await supabase
      .from('users')
      .update({ stripe_connected_account: 'connected' })
      .eq('id', session.user?.id)

    if (error) {
      console.error(error)
    }
  }
}

export async function getConnectedAccount() {
  const supabase = createClient()

  const { stripeAccount, userError } = await getStripeAccount()

  if (stripeAccount?.stripe_account_id === null) {
    const { data: session } = await supabase.auth.getUser()

    if (session && session.user) {
      await createSeller(session.user?.id, session.user?.email)
    }
  }

  let connectedAccount = stripeAccount?.stripe_connected_account

  if (userError) {
    console.error(userError)
  }

  if (stripeAccount && !connectedAccount) {
    const connectedAccounts = await stripe.accounts.listExternalAccounts(
      stripeAccount?.stripe_account_id,
    )

    if (!connectedAccounts) {
      console.error(userError)
    }

    connectedAccount = connectedAccounts

    await updateStripeConnectedAccount(connectedAccounts)
  }

  return connectedAccount
}

export async function createStripeAccountLink() {
  const { stripeAccount, userError } = await getStripeAccount()

  if (userError) {
    console.error(userError)
  }

  if (stripeAccount) {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.stripe_account_id as string,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/config/billing`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/config/billing`,
      type: 'account_onboarding',
    })

    return redirect(accountLink.url as string)
  }
}

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
