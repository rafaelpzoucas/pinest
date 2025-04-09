import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  const isPreviewEnv = hostname === 'staging-pinest.vercel.app'

  // 👉 Detecta admin
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
    // Usa o path para detectar o "subdomínio"
    const segments = url.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null

    if (subdomain) {
      const remainingPath = segments.slice(1).join('/')
      url.pathname = remainingPath
        ? `/${subdomain}/${remainingPath}`
        : `/${subdomain}`
    }
  } else {
    // Ambiente de produção com subdomínio real
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
      url.pathname =
        url.pathname === '/' ? `/${subdomain}` : `/${subdomain}${url.pathname}`
    } else {
      // Domínio raiz (landing page)
      return response
    }
  }

  if (subdomain) {
    response.cookies.set(`public_store_subdomain`, subdomain, { path: '/' })
    return NextResponse.rewrite(url, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
