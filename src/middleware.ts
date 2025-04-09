import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  // 👉 Detecta se o subdomínio é "admin"
  const isAdminSubdomain =
    process.env.NODE_ENV === 'production'
      ? hostname.startsWith('admin.')
      : url.pathname.startsWith('/admin') // para desenvolvimento, assume que acessar /admin já é admin

  if (isAdminSubdomain) {
    url.pathname = '/admin' + url.pathname
    return NextResponse.rewrite(url, response)
  }

  // ⚠️ Ignora rotas que começam com /admin ou /api
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return response
  }

  let subdomain: string | null = null

  if (process.env.NODE_ENV !== 'production') {
    const segments = url.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null

    if (subdomain) {
      const remainingPath = segments.slice(1).join('/')
      url.pathname = remainingPath
        ? `/${subdomain}/${remainingPath}`
        : `/${subdomain}`
    }
  } else {
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
      url.pathname =
        url.pathname === '/' ? `/${subdomain}` : `/${subdomain}${url.pathname}`
    } else {
      // 👉 Acesso à raiz do domínio principal (ex: pinest.com.br), renderiza normalmente
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
