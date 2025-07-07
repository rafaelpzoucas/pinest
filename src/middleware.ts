import { NextRequest, NextResponse } from 'next/server'

const IGNORED_PREFIXES = ['/_next', '/api', '/favicon.ico', '/admin']
const STAGING_HOSTS = [
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
  'localhost:3000',
]

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  // Ignorar rotas específicas e arquivos estáticos
  if (
    IGNORED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const isStagingHost = STAGING_HOSTS.includes(hostname)
  const prodMatch = hostname.match(/^(?<store>[^.]+)\.pinest\.com\.br$/)

  if (prodMatch?.groups && !isStagingHost) {
    const subdomain = prodMatch.groups.store
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`

    const response = NextResponse.rewrite(url)

    // Setar cookie só se estiver diferente ou ausente
    const existing = request.cookies.get('public_store_subdomain')?.value
    if (existing !== subdomain) {
      response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    }

    return response
  }

  // Ambiente de staging ou local
  if (isStagingHost) {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      const subdomain = segments[0]
      const response = NextResponse.next()

      const existing = request.cookies.get('public_store_subdomain')?.value
      if (existing !== subdomain) {
        response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
      }

      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|admin|api).*)',
  ],
}
