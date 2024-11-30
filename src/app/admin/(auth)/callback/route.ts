'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { readOwner } from '../../(protected)/(app)/actions'
import { createOwner } from '../../(protected)/onboarding/actions'

async function createStripeCheckoutSession(
  lineItems: {
    price: string
    quantity: number
  }[],
  successUrl: string,
  cancelUrl: string,
) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return session
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    throw error
  }
}

export async function createSubscriptionCheckout() {
  const session = await createStripeCheckoutSession(
    [
      {
        price: 'price_1QPCc3GAxPgMyeA1B2QhO3pn',
        quantity: 1,
      },
    ],
    `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
    `${process.env.NEXT_PUBLIC_APP_URL}/`,
  )

  return redirect(session.url as string)
}

export async function GET(request: Request) {
  const supabase = createClient()

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: session, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !session?.user) {
    return NextResponse.redirect('/admin/sign-in')
  }

  const { owner, ownerError } = await readOwner()

  if (ownerError) {
    console.error(ownerError)
  }

  if (!owner) {
    const { createOwnerError } = await createOwner()

    if (createOwnerError) {
      console.error(createOwnerError)
    }

    return NextResponse.redirect(`${origin}/admin/onboarding/store/basic`)
  }

  if (owner.subscription_status !== 'active') {
    await createSubscriptionCheckout()
  }

  return NextResponse.redirect(`${origin}/admin/dashboard`)
}
