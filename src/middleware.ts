import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  let subdomain: string | null = null

  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  if (isDev) {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      subdomain = segments[0]
    }
  } else {
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
    }
  }

  const res = response instanceof NextResponse ? response : NextResponse.next()

  if (subdomain && subdomain !== 'undefined') {
    res.cookies.set('public_store_subdomain', subdomain, {
      path: '/',
    })
  } else {
    res.cookies.delete('public_store_subdomain') // remove se não tiver valor válido
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/v1/customer/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
