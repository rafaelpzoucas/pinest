import { selectCustomerUser } from '@/app/[public_store]/account/actions'
import { createClient } from '@/lib/supabase/server'
import { createPath } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const subdomain = requestUrl.searchParams.get('subdomain')
  const checkout = requestUrl.searchParams.get('checkout')
  const origin = requestUrl.origin

  const supabase = createClient()

  let redirectURL = ''

  if (process.env.NODE_ENV !== 'production') {
    // Em ambiente de desenvolvimento utilizamos createPath
    const accountPath =
      checkout === 'true' ? '/account?checkout=pickup' : '/purchases'
    redirectURL = `${origin}${createPath(accountPath, subdomain)}`
  } else {
    // Em produção utilizamos o formato subdomínio.pinest.com.br
    redirectURL =
      checkout === 'true'
        ? `https://${subdomain}.com.br/account?checkout=pickup`
        : `https://${subdomain}.com.br/purchases`
  }

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
