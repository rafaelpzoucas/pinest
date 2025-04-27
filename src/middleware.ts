import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  // Verifica se o hostname começa com "www" e redireciona para o domínio sem o www
  if (hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '')
    const newUrl = url.clone()
    newUrl.hostname = newHostname
    return NextResponse.redirect(newUrl)
  }

  // 🔁 Redireciona /admin para /admin/dashboard
  if (url.pathname === '/admin') {
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // ⚠️ Ignora rotas que começam com /admin
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return response
  }

  let subdomain: string | null = null

  if (process.env.NODE_ENV !== 'production') {
    // Em ambiente local, o subdomínio é extraído do caminho (localhost:3000/nomedaloja)
    const segments = url.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null

    if (subdomain) {
      // Remove o primeiro segmento (nome da loja) e mantém o resto do caminho
      const remainingPath = segments.slice(1).join('/')
      url.pathname = remainingPath
        ? `/${subdomain}/${remainingPath}`
        : `/${subdomain}`
    }
  } else {
    // Em produção, captura o subdomínio de "nomedaloja.pinest.com.br"
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]

      // Mantém o pathname original, mas adiciona o subdomínio como primeiro segmento
      url.pathname =
        url.pathname === '/' ? `/${subdomain}` : `/${subdomain}${url.pathname}`
    }
  }

  if (subdomain) {
    // Define um cookie para armazenar a loja acessada
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
