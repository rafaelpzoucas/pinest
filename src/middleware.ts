import { NextRequest, NextResponse } from 'next/server'
import { ROOT_DOMAIN, STAGING_HOSTS } from './lib/helpers'

// caminhos que não devem passar pelo rewrite
const IGNORED_PATHS = ['/_next', '/api', '/favicon.ico', '/admin', '/sw.js']

// mapeamento de domínios customizados para slugs de loja
const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  'sandubadaleyla.com.br': 'sandubadaleyla',
  // adicione outros domínios customizados aqui
}

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  // DEBUG: informações da requisição
  console.log('🔍 MIDDLEWARE:', {
    hostname,
    pathname,
    userAgent: request.headers.get('user-agent')?.slice(0, 50),
  })

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const isStaging = STAGING_HOSTS.includes(hostname)
  const isProdHost = hostname.endsWith(`.${ROOT_DOMAIN}`) && !isStaging
  const isCustomDomain = Object.prototype.hasOwnProperty.call(
    CUSTOM_DOMAIN_MAP,
    hostname,
  )

  console.log('🔍 CONDITIONS:', {
    isStaging,
    isProdHost,
    isCustomDomain,
    ROOT_DOMAIN,
  })

  // ignorar assets, API e paths estáticos
  const shouldIgnore =
    IGNORED_PATHS.some((p) => pathname.startsWith(p)) ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$/.test(pathname)

  if (shouldIgnore) {
    console.log('🔍 IGNORED PATH:', pathname)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // custom domain: reescreve para o slug configurado
  if (isCustomDomain) {
    const storeSlug = CUSTOM_DOMAIN_MAP[hostname]
    const url = request.nextUrl.clone()
    url.pathname = `/${storeSlug}${pathname === '/' ? '' : pathname}`

    console.log('🔍 CUSTOM DOMAIN REWRITE:', {
      from: `${hostname}${pathname}`,
      to: url.pathname,
    })

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  // produção com subdomínio: shop.example.com → /shop/*
  if (isProdHost) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '').split('.')[0]
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`

    console.log('🔍 PROD HOST REWRITE:', {
      from: `${hostname}${pathname}`,
      to: url.pathname,
    })

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  // fallback: passa adiante sem alteração
  console.log('🔍 DEFAULT - NextResponse.next()')
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next|api|admin|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)',
  ],
}
