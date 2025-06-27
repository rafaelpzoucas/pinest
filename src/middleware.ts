import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const STAGING_DOMAINS = ['staging.pinest.com.br', 'staging-pinest.vercel.app']
const PRODUCTION_DOMAINS = ['pinest.com.br', 'www.pinest.com.br']
const IGNORED_PATHS = ['/admin', '/api']

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  const isLocalhost = hostname.startsWith('localhost')
  const isStaging = STAGING_DOMAINS.includes(hostname)
  const isProduction = PRODUCTION_DOMAINS.includes(hostname)

  // Ignora paths específicos
  if (IGNORED_PATHS.some((p) => pathname.startsWith(p))) {
    return await updateSession(request)
  }

  // Caso localhost ou staging: extrai subdomínio da pathname
  if (isLocalhost || isStaging) {
    const segments = pathname.split('/').filter(Boolean)
    const subdomain = segments[0] || null

    if (!subdomain) {
      return await updateSession(request)
    }

    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/${subdomain}${pathname.slice(subdomain.length + 1)}`

    const response = NextResponse.rewrite(newUrl)
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    await updateSession(request)
    return response
  }

  // Produção
  if (isProduction) {
    const parts = hostname.split('.')
    const subdomain =
      parts.length > 2 ? (parts[0] === 'www' ? parts[1] : parts[0]) : null

    if (!subdomain) {
      // Dominio raiz => renderiza landing page
      return await updateSession(request)
    }

    // Subdomínio de produção (ex: sanduba.pinest.com.br)
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/${subdomain}${pathname}`

    const response = NextResponse.rewrite(newUrl)
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    await updateSession(request)
    return response
  }

  // Caso nenhum domínio conhecido (fallback)
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
