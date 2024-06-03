// app/api/create-seller/route.ts
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { userId, email } = await request.json()

  try {
    const account = await stripe.accounts.create({
      email,
      type: 'express', // Definindo o tipo de conta
      country: 'BR',
      business_type: 'individual', // Adicione este campo ou ajuste conforme necessário
    })

    const { error } = await supabase
      .from('users')
      .update({ stripe_account_id: account.id })
      .eq('id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic' // Para garantir que a rota não seja cacheada
