import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const IGNORED_PREFIXES = ['/_next', '/api', '/favicon.ico']
const STAGING_HOSTS = [
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
  'localhost:3000',
]

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  console.log('Middleware executando para:', { hostname, pathname })

  // Ignora estáticos e APIs
  if (IGNORED_PREFIXES.some((p) => pathname.startsWith(p))) {
    console.log('Middleware: Ignorando path:', pathname)
    return NextResponse.next()
  }

  let subdomain: string | undefined

  // Tentativa de capturar subdomínio em produção, mas não em staging
  const prodMatch = hostname.match(/^(?<store>[^.]+)\.pinest\.com\.br$/)
  const isStagingHost = STAGING_HOSTS.includes(hostname)

  console.log('Middleware: Análise do hostname:', {
    hostname,
    prodMatch: prodMatch?.groups,
    isStagingHost,
  })

  if (prodMatch && prodMatch.groups && !isStagingHost) {
    // Produção real - subdomínio como loja.pinest.com.br
    subdomain = prodMatch.groups.store
    console.log('Middleware: Subdomínio detectado em produção:', subdomain)
  } else if (isStagingHost || hostname.includes('localhost')) {
    // Localhost ou staging: primeiro segmento de path
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      subdomain = segments[0]
      console.log('Middleware: Subdomínio detectado em staging/dev:', subdomain)
    }
  }

  if (subdomain) {
    const response = NextResponse.next()
    response.cookies.set('public_store_subdomain', subdomain, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    console.log('Middleware: Cookie definido para subdomain:', subdomain)
    return response
  }

  console.log(
    'Middleware: Nenhum subdomínio detectado para:',
    hostname,
    pathname,
  )
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
