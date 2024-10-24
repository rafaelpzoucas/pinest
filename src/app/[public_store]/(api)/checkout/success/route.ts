import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()

  const requestUrl = new URL(request.url)
  const storeName = requestUrl.searchParams.get('store-name')
  const purchaseId = requestUrl.searchParams.get('purchase')
  const stripeAccountId = requestUrl.searchParams.get('stripe_account')
  const amount = requestUrl.searchParams.get('amount')
  const paymentIntentId = requestUrl.searchParams.get('payment_intent')

  const origin = requestUrl.origin

  if (!storeName || !purchaseId || !paymentIntentId) {
    return NextResponse.json(
      { error: 'Missing required parameters.' },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('purchases')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', purchaseId)

  if (error) {
    console.error('Supabase Error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase.' },
      { status: 500 },
    )
  }

  if (!amount || !stripeAccountId) {
    return NextResponse.json(
      { error: 'Missing required parameters. (amount & stripeAccountId)' },
      { status: 400 },
    )
  }

  try {
    const charge = await stripe.charges.retrieve(paymentIntentId) // Recupera o ID da cobrança

    const transfer = await stripe.transfers.create({
      amount: Math.round(parseFloat(amount) * 100), // Valor em centavos
      currency: 'brl',
      destination: stripeAccountId,
      source_transaction: charge.id, // Usa a cobrança como source_transaction
    })

    console.log('Transfer successful:', transfer)
  } catch (err) {
    console.error('Stripe Error:', err)
    return NextResponse.json(
      { error: 'Failed to create transfer.' },
      { status: 500 },
    )
  }

  revalidatePath('/purchases')

  return NextResponse.redirect(`${origin}/${storeName}/purchases?callback=home`)
}
