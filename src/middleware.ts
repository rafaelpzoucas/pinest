import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getStoreByCustomDomain(hostname: string) {
  const supabase = createClient()

  // Remove www. se existir
  const domain = hostname.replace(/^www\./, '')

  const { data, error } = await supabase
    .from('stores')
    .select('store_subdomain, custom_domain')
    .eq('custom_domain', domain)
    .single()

  if (error || !data) {
    console.error('Erro ao buscar domínio personalizado:', domain, error)
    return null
  }

  console.log(
    'Domínio personalizado encontrado:',
    domain,
    'para loja:',
    data.store_subdomain,
  )
  return data
}

export async function middleware(request: NextRequest) {
  // Ignorar rotas de API específicas
  if (request.nextUrl.pathname.startsWith('/api/v1/customer/auth/callback')) {
    return NextResponse.next()
  }

  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  let subdomain: string | null = null

  // Verificar se é um domínio personalizado
  if (
    process.env.NODE_ENV === 'production' &&
    !hostname.endsWith('pinest.com.br') &&
    hostname !== 'localhost'
  ) {
    const customDomainStore = await getStoreByCustomDomain(hostname)

    if (customDomainStore && customDomainStore.store_subdomain) {
      // Garantindo que subdomain seja uma string
      const storeSubdomain: string = customDomainStore.store_subdomain

      // Mantém o pathname original, mas adiciona o subdomínio como primeiro segmento
      url.pathname =
        url.pathname === '/'
          ? `/${storeSubdomain}`
          : `/${storeSubdomain}${url.pathname}`

      // Define um cookie para armazenar a loja acessada
      const cookieName = `public_store_${storeSubdomain}`
      response.cookies.set(cookieName, storeSubdomain, {
        path: '/',
        sameSite: 'lax',
        domain: hostname, // Use o domínio atual para o cookie
      })

      return NextResponse.rewrite(url, response)
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    // Em ambiente local, o subdomínio é extraído do caminho (localhost:3000/nomedaloja)
    const segments = url.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null

    if (subdomain) {
      // Remove o primeiro segmento (nome da loja) e mantém o resto do caminho
      const remainingPath = segments.slice(1).join('/')
      url.pathname = remainingPath
        ? `/${subdomain}/${remainingPath}`
        : `/${subdomain}`
    }
  } else {
    // Em produção, captura o subdomínio de "nomedaloja.pinest.com.br"
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]

      // Mantém o pathname original, mas adiciona o subdomínio como primeiro segmento
      url.pathname =
        url.pathname === '/' ? `/${subdomain}` : `/${subdomain}${url.pathname}`
    }
  }

  if (subdomain) {
    // Define um cookie para armazenar a loja acessada
    const cookieName = `public_store_${subdomain}`
    response.cookies.set(cookieName, subdomain, {
      path: '/',
      sameSite: 'lax',
    })
    return NextResponse.rewrite(url, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/v1/customer/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
