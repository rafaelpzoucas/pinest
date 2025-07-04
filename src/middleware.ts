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

  // Ignora estáticos e APIs
  if (IGNORED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  let subdomain: string | undefined

  // Tentativa de capturar subdomínio em produção, mas não em staging
  const prodMatch = hostname.match(/^(?<store>[^.]+)\.pinest\.com\.br$/)
  const isStagingHost = STAGING_HOSTS.includes(hostname)

  if (prodMatch && prodMatch.groups && !isStagingHost) {
    // Produção real
    subdomain = prodMatch.groups.store
  } else {
    // Localhost ou staging: primeiro segmento de path
    const segments = pathname.split('/').filter(Boolean)
    subdomain = segments[0]
  }

  if (subdomain) {
    const response = NextResponse.next()
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    return response
  }

  return NextResponse.next()
}

export const config = {
  // O matcher do next.config.js já aplica as rotas relevantes
}
