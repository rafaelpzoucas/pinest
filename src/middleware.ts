import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const IMAGE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp']

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // Ignorar caminhos específicos
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  ) {
    return NextResponse.next()
  }

  // Redirecionar /admin → /admin/dashboard
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Ignorar reescrita para /admin e /api
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return updateSession(request)
  }

  // Subdomínio dinâmico
  const processed = request.cookies.get('processed_request')
  let storeSubdomain: string | null = null

  if (!processed) {
    const isProd = process.env.NODE_ENV === 'production'

    if (isProd) {
      const domainParts = hostname.split('.')
      if (domainParts.length >= 3 && !['www'].includes(domainParts[0])) {
        storeSubdomain = domainParts[0]
      }
    } else {
      const segments = pathname.split('/')
      if (segments.length > 1 && segments[1]) {
        storeSubdomain = segments[1]
      }
    }

    if (storeSubdomain) {
      const newPathname = isProd ? `/${storeSubdomain}${pathname}` : pathname // já está com o subdomínio no path

      const rewrittenUrl = request.nextUrl.clone()
      rewrittenUrl.pathname = newPathname

      const response = await updateSession(request)
      const updated = NextResponse.rewrite(rewrittenUrl)

      // Copiar cookies da sessão
      for (const cookie of response.cookies.getAll()) {
        updated.cookies.set(cookie.name, cookie.value, {
          path: cookie.path,
          httpOnly: cookie.httpOnly,
          maxAge: cookie.maxAge,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
        })
      }

      // Setar cookies auxiliares
      updated.cookies.set('public_store_subdomain', storeSubdomain)
      updated.cookies.set('processed_request', 'true', {
        httpOnly: true,
        maxAge: 5,
      })

      return updated
    }
  }

  return updateSession(request)
}
