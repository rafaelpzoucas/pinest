import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const STAGING_DOMAINS = ['staging.pinest.com.br', 'staging-pinest.vercel.app']
const PRODUCTION_ROOT_DOMAINS = ['pinest.com.br', 'www.pinest.com.br']
const IGNORED_PATHS = ['/admin', '/api']

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  const isLocalhost = hostname.startsWith('localhost')
  const isStaging = STAGING_DOMAINS.includes(hostname)
  const isProductionRoot = PRODUCTION_ROOT_DOMAINS.includes(hostname)
  const isProductionSubdomain =
    hostname.endsWith('.pinest.com.br') && !isProductionRoot

  // Ignora paths específicos
  if (IGNORED_PATHS.some((p) => pathname.startsWith(p))) {
    return await updateSession(request)
  }

  // localhost ou staging → subdomínio no path
  if (isLocalhost || isStaging) {
    const segments = pathname.split('/').filter(Boolean)
    const subdomain = segments[0] || null

    if (!subdomain) {
      return await updateSession(request)
    }

    const newUrl = url.clone()
    newUrl.pathname = `/${subdomain}${pathname.slice(subdomain.length + 1)}`

    const response = NextResponse.rewrite(newUrl)
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    await updateSession(request)
    return response
  }

  // produção com subdomínio (ex: nomedaloja.pinest.com.br)
  if (isProductionSubdomain) {
    const parts = hostname.split('.')
    const subdomain = parts[0] // nomedaloja

    const newUrl = url.clone()
    newUrl.pathname = `/${subdomain}${pathname}`

    const response = NextResponse.rewrite(newUrl)
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    await updateSession(request)
    return response
  }

  // produção sem subdomínio (landing page)
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
