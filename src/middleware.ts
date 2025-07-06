import { NextRequest, NextResponse } from 'next/server'

const IGNORED_PREFIXES = ['/_next', '/api', '/favicon.ico']
const STAGING_HOSTS = [
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
  'localhost:3000',
]

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  // Ignora assets e APIs
  if (IGNORED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const isStagingHost = STAGING_HOSTS.includes(hostname)

  let subdomain: string | undefined

  // Se estiver em produção (não é staging)
  const prodMatch = hostname.match(/^(?<store>[^.]+)\.pinest\.com\.br$/)

  if (prodMatch && prodMatch.groups && !isStagingHost) {
    subdomain = prodMatch.groups.store

    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`

    const response = NextResponse.rewrite(url)
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    return response
  }

  // Em staging/local, define subdomínio como o primeiro segmento do path
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    subdomain = segments[0]
    const response = NextResponse.next()
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/:path((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
