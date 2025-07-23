import { NextRequest, NextResponse } from 'next/server'
import { ROOT_DOMAIN, STAGING_HOSTS } from './lib/helpers'

const IGNORED_PATHS = ['/_next', '/api', '/favicon.ico', '/admin', '/sw.js']

const CUSTOM_DOMAIN_MAP: Record<string, string> = {
  'sandubadaleyla.com.br': 'sandubadaleyla',
  // outros domínios personalizados
}

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const isStaging = STAGING_HOSTS.includes(hostname)
  const isProdHost = hostname.endsWith(`.${ROOT_DOMAIN}`) && !isStaging
  const isCustomDomain = hostname in CUSTOM_DOMAIN_MAP

  const shouldIgnore =
    IGNORED_PATHS.some((p) => pathname.startsWith(p)) ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|map)$/.test(pathname)

  if (shouldIgnore) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  let subdomain: string | null = null

  if (isProdHost) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '').split('.')[0]
  } else if (isCustomDomain) {
    subdomain = CUSTOM_DOMAIN_MAP[hostname]
  }

  if (subdomain) {
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}
