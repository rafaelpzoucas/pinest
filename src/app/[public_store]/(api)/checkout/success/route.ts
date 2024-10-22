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

  const origin = requestUrl.origin

  const { error } = await supabase
    .from('purchases')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', purchaseId)
    .select('*')

  if (error) {
    console.error(error)
  }

  if (stripeAccountId && amount) {
    const transfer = await stripe.transfers.create({
      amount: parseFloat(amount),
      currency: 'brl',
      destination: stripeAccountId,
    })

    if (!transfer) {
      console.error(transfer)
    }
  }

  revalidatePath('/purchases')

  return NextResponse.redirect(`${origin}/${storeName}/purchases?callback=home`)
}
