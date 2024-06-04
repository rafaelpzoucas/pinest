'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function createSeller(userId: string, email?: string) {
  const supabase = createClient()

  const account = await stripe.accounts.create({
    email,
    type: 'express',
    country: 'BR',
    business_type: 'individual',
  })

  const { data, error } = await supabase
    .from('users')
    .update({ stripe_account_id: account.id })
    .eq('id', userId)

  if (error) {
    console.error(error)
  }

  return data
}
