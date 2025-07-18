import { NextRequest, NextResponse } from 'next/server'
import { ROOT_DOMAIN, STAGING_HOSTS } from './lib/helpers'

const IGNORED_PATHS = ['/_next', '/api', '/favicon.ico', '/admin', '/sw.js']

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const isStaging = STAGING_HOSTS.includes(hostname)
  const isProdHost = hostname.endsWith(`.${ROOT_DOMAIN}`) && !isStaging

  // Verifica se é rota ignorada
  const shouldIgnore =
    IGNORED_PATHS.some((p) => pathname.startsWith(p)) ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$/.test(pathname)

  if (shouldIgnore) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  if (isProdHost) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '').split('.')[0]
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next|api|admin|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$).*)',
  ],
}
