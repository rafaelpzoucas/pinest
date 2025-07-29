import { NextRequest, NextResponse } from 'next/server'
import { ROOT_DOMAIN, STAGING_HOSTS } from './lib/helpers'
import { normalizeHost } from './lib/utils'

// caminhos que não devem passar pelo rewrite
const IGNORED_PATHS = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/admin',
  '/sw.js',
  '/docs',
]

// mapeamento de domínios customizados para slugs de loja
export const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  'sandubadaleyla.com.br': 'sandubadaleyla',
  // adicione outros domínios customizados aqui
}

export function isCustomDomainMapped(host: string): boolean {
  const normalizedHost = normalizeHost(host)
  return Object.prototype.hasOwnProperty.call(CUSTOM_DOMAIN_MAP, normalizedHost)
}

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const isStaging = STAGING_HOSTS.includes(hostname)
  const isProdHost = hostname.endsWith(`.${ROOT_DOMAIN}`) && !isStaging
  const isCustomDomain = isCustomDomainMapped(hostname)

  // ignorar assets, API e paths estáticos
  const shouldIgnore =
    IGNORED_PATHS.some((p) => pathname.startsWith(p)) ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$/.test(pathname)

  if (shouldIgnore) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // custom domain: reescreve para o slug configurado
  if (isCustomDomain) {
    const storeSlug = CUSTOM_DOMAIN_MAP[hostname]
    const url = request.nextUrl.clone()
    url.pathname = `/${storeSlug}${pathname === '/' ? '' : pathname}`

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  // produção com subdomínio: shop.example.com → /shop/*
  if (isProdHost) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '').split('.')[0]

    if (subdomain === 'www') {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }

    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next|api|admin|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)',
  ],
}
