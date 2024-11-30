import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error(`Webhook error: ${err}`)
    return new Response(`Webhook error: ${err}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const { purchaseId, stripeAccountId, amount } = paymentIntent.metadata

    const { error } = await supabase
      .from('purchases')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', purchaseId)

    if (error) console.error(error)

    const transfer = await stripe.transfers.create({
      amount: parseFloat(amount),
      currency: 'brl',
      destination: stripeAccountId,
    })

    if (!transfer) console.error('Erro ao criar transferência:', transfer)
  }

  return new Response('Webhook recebido', { status: 200 })
}
