import { createClient } from '@/lib/supabase/server'
import { createPath } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const subdomain = requestUrl.searchParams.get('subdomain')
  const checkout = requestUrl.searchParams.get('checkout')
  const customDomain = requestUrl.searchParams.get('custom_domain')
  const origin = requestUrl.origin

  // Detectar se é staging baseado no hostname da requisição
  const isStagingHost =
    origin.includes('staging.pinest.com.br') ||
    origin.includes('staging-pinest.vercel.app')

  console.log('Callback recebido:', {
    code: code ? 'presente' : 'ausente',
    error,
    errorDescription,
    subdomain,
    checkout,
    customDomain,
    origin,
    isStagingHost,
    url: request.url,
    nodeEnv: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  // Verificar se há erro do Google OAuth
  if (error) {
    console.error('Erro do Google OAuth:', { error, errorDescription })
    return NextResponse.redirect(
      `${origin}/sign-in?error=oauth_error&message=${errorDescription || error}`,
    )
  }

  // Verificar se há código
  if (!code) {
    console.error('Código de autorização não encontrado')
    return NextResponse.redirect(`${origin}/sign-in?error=no_code`)
  }

  const supabase = createClient()

  // Autenticação com o Supabase
  try {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Erro ao trocar código por sessão:', exchangeError)
      return NextResponse.redirect(
        `${origin}/sign-in?error=auth_failed&message=${exchangeError.message}`,
      )
    }
  } catch (error) {
    console.error('Erro inesperado na autenticação:', error)
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
  }

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !session?.user) {
    console.error('Erro ao obter usuário:', sessionError)
    return NextResponse.redirect(`${origin}/sign-in?error=session_failed`)
  }

  console.log('Usuário autenticado:', {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata.name,
  })

  // Inserir usuário na tabela users se não existir
  try {
    const { error: usersError } = await supabase.from('users').upsert(
      [
        {
          id: session.user?.id,
          name: session.user?.user_metadata.name,
          email: session.user?.email,
          role: 'customer',
        },
      ],
      {
        onConflict: 'id',
      },
    )

    if (usersError) {
      console.error('Erro ao inserir/atualizar usuário:', usersError)
    } else {
      console.log('Usuário inserido/atualizado com sucesso')
    }
  } catch (error) {
    console.error('Erro inesperado ao inserir usuário:', error)
  }

  let redirectURL = ''

  if (customDomain) {
    // Se tiver um domínio personalizado, usamos ele diretamente
    const domain = customDomain.startsWith('http')
      ? customDomain
      : `https://${customDomain}`

    redirectURL =
      checkout === 'true'
        ? `${domain}/account?checkout=pickup`
        : `${domain}/purchases`
  } else if (isStagingHost || process.env.NODE_ENV !== 'production') {
    // Em ambiente de desenvolvimento ou staging utilizamos createPath
    const accountPath =
      checkout === 'true' ? '/account?checkout=pickup' : '/purchases'
    redirectURL = `${origin}${createPath(accountPath, subdomain)}`

    console.log('Redirecionamento staging/dev:', {
      condition: 'staging_or_dev',
      accountPath,
      subdomain,
      createPathResult: createPath(accountPath, subdomain),
      redirectURL,
    })
  } else {
    // Em produção utilizamos o formato subdomínio.pinest.com.br
    if (!subdomain) {
      console.error('Subdomain não encontrado em produção')
      return NextResponse.redirect(`${origin}/sign-in?error=missing_subdomain`)
    }

    redirectURL =
      checkout === 'true'
        ? `https://${subdomain}.pinest.com.br/account?checkout=pickup`
        : `https://${subdomain}.pinest.com.br/purchases`

    console.log('Redirecionamento produção:', {
      condition: 'production',
      subdomain,
      redirectURL,
    })
  }

  console.log('Redirecionamento final para:', redirectURL)
  return NextResponse.redirect(redirectURL)
}
