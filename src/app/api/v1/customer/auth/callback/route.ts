import { selectCustomerUser } from '@/app/[public_store]/account/actions'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const storeName = requestUrl.searchParams.get('store-name')
  const checkout = requestUrl.searchParams.get('checkout')
  const origin = requestUrl.origin

  const supabase = createClient()

  const redirectURL =
    checkout === 'true'
      ? `${origin}/${storeName}/account?checkout=pickup`
      : `${origin}/${storeName}/purchases`

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: session, error } = await supabase.auth.getUser()

  if (!error) {
    const { error: usersError } = await supabase
      .from('users')
      .insert([
        {
          id: session.user?.id,
          name: session.user?.user_metadata.name,
          email: session.user?.email,
          role: 'customer',
        },
      ])
      .select()

    if (usersError) {
      console.error(usersError)
    }
  }

  if (session) {
    const { customerUser } = await selectCustomerUser()

    if (!customerUser?.cpf_cnpj) {
      return NextResponse.redirect(redirectURL)
    }
  }

  return NextResponse.redirect(redirectURL)
}
