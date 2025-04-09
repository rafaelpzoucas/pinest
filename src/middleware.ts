import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  const isPreviewEnv = hostname === 'staging-pinest.vercel.app'

  // 🔐 ADMIN: subdomínio admin (em produção) ou /admin no preview/dev
  const isAdmin =
    (process.env.NODE_ENV === 'production' && hostname.startsWith('admin.')) ||
    (isPreviewEnv && url.pathname.startsWith('/admin')) ||
    (!isPreviewEnv && url.pathname.startsWith('/admin'))

  if (isAdmin) {
    url.pathname = '/admin' + url.pathname.replace('/admin', '')
    return NextResponse.rewrite(url, response)
  }

  // ⚠️ Ignora rotas que começam com /admin ou /api
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return response
  }

  let subdomain: string | null = null

  if (isPreviewEnv || process.env.NODE_ENV !== 'production') {
    // ➕ DEV ou PREVIEW → subdomínio vem do PATH
    const segments = url.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null

    if (subdomain) {
      const remainingPath = segments.slice(1).join('/')
      url.pathname = remainingPath
        ? `/${subdomain}/${remainingPath}`
        : `/${subdomain}`
    }
  } else {
    // ➕ PRODUÇÃO → subdomínio vem do HOSTNAME
    const parts = hostname.split('.')

    // hostname: pinest.com.br (sem subdomínio) → landing
    if (parts.length === 2) {
      return response
    }

    // hostname: admin.pinest.com.br → já tratado acima
    // hostname: loja123.pinest.com.br
    subdomain = parts[0]

    if (subdomain) {
      url.pathname =
        url.pathname === '/' ? `/${subdomain}` : `/${subdomain}${url.pathname}`
    }
  }

  if (subdomain) {
    response.cookies.set('public_store_subdomain', subdomain, { path: '/' })
    return NextResponse.rewrite(url, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
