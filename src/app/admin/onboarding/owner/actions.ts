'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { ownerFormSchema } from './form'

export async function createOwner(
  columns: z.infer<typeof ownerFormSchema>,
): Promise<{
  ownerError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { error: ownerError } = await supabase.from('users').insert({
    id: session.user?.id,
    email: session.user?.email,
    role: 'admin',
    ...columns,
  })

  if (session.user) {
    const response = await createSeller(session.user?.id, session.user?.email)

    if (response) {
      console.log('Seller account created successfully')
    } else {
      console.error('Error creating seller account')
    }
  }

  return { ownerError }
}

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
