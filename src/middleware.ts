import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const STAGING_DOMAINS = ['staging.pinest.com.br', 'staging-pinest.vercel.app']
const PRODUCTION_ROOT_DOMAINS = ['pinest.com.br', 'www.pinest.com.br']
const IGNORED_PATHS = ['/admin', '/api']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname

  // Ignora paths específicos incluindo callbacks de autenticação
  if (
    IGNORED_PATHS.some((p) => pathname.startsWith(p)) ||
    /\/auth\/callback$/.test(pathname)
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    },
  )

  await supabase.auth.getUser()

  const isLocalhost = hostname.startsWith('localhost')
  const isStaging = STAGING_DOMAINS.includes(hostname)
  const isProductionRoot = PRODUCTION_ROOT_DOMAINS.includes(hostname)
  const isProductionSubdomain =
    hostname.endsWith('.pinest.com.br') && !isProductionRoot

  // localhost ou staging → subdomínio no path
  if (isLocalhost || isStaging) {
    const segments = pathname.split('/').filter(Boolean)
    const subdomain = segments[0] || null

    // Não reescrever se for callback de auth
    if (!subdomain || /\/auth\/callback$/.test(pathname)) {
      return response
    }

    const newUrl = url.clone()
    newUrl.pathname = `/${subdomain}${pathname.slice(subdomain.length + 1)}`

    const rewriteResponse = NextResponse.rewrite(newUrl)

    response.cookies
      .getAll()
      .forEach((cookie) => rewriteResponse.cookies.set(cookie))

    rewriteResponse.cookies.set('public_store_subdomain', subdomain, {
      path: '/',
    })

    return rewriteResponse
  }

  // produção com subdomínio (ex: nomedaloja.pinest.com.br)
  if (isProductionSubdomain) {
    const parts = hostname.split('.')
    const subdomain = parts[0] // nomedaloja

    // Não reescrever se for callback de auth
    if (/\/auth\/callback$/.test(pathname)) {
      return response
    }

    const newUrl = url.clone()
    newUrl.pathname = `/${subdomain}${pathname}`

    const rewriteResponse = NextResponse.rewrite(newUrl)

    response.cookies
      .getAll()
      .forEach((cookie) => rewriteResponse.cookies.set(cookie))

    rewriteResponse.cookies.set('public_store_subdomain', subdomain, {
      path: '/',
    })
    return rewriteResponse
  }

  // produção sem subdomínio (landing page)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
