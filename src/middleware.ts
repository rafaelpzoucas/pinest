import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const IGNORED_HOSTS = ['pinest.com.br']
const IGNORED_PATHS = ['/admin', '/api']

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  const isLocalhost = hostname.startsWith('localhost')

  // Ignora hosts específicos em produção
  if (!isLocalhost && IGNORED_HOSTS.includes(hostname)) {
    return await updateSession(request)
  }

  // Ignora paths específicos
  if (IGNORED_PATHS.some((p) => pathname.startsWith(p))) {
    return await updateSession(request)
  }

  let subdomain: string | null = null

  if (isLocalhost) {
    // Extrai o primeiro segmento da rota (ex: /sanduba/...)
    const segments = pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null
  } else {
    // Extrai subdomínio do host (excluindo www)
    const parts = hostname.split('.')
    subdomain =
      parts.length > 2 ? (parts[0] === 'www' ? parts[1] : parts[0]) : null
  }

  if (!subdomain) {
    return await updateSession(request)
  }

  // Reescreve a URL apenas se não estiver no localhost
  const response = isLocalhost
    ? NextResponse.next()
    : NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, request.url))

  // Seta cookie com subdomínio
  response.cookies.set('public_store_subdomain', subdomain, {
    path: '/',
  })

  await updateSession(request)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
