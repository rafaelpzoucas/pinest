import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  // Evita processar URLs de recursos estáticos
  if (
    url.pathname.includes('/_next') ||
    url.pathname.includes('/favicon.ico') ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return response
  }

  // // Verifica se o hostname começa com "www" e redireciona para o domínio sem o www
  // if (hostname.startsWith('www.')) {
  //   const newHostname = hostname.replace('www.', '')
  //   const newUrl = url.clone()
  //   newUrl.hostname = newHostname
  //   return NextResponse.redirect(newUrl, { status: 301 })
  // }

  // 🔁 Redireciona /admin para /admin/dashboard
  if (url.pathname === '/admin') {
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // ⚠️ Ignora rotas que começam com /admin ou /api
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

      // Verifica se já estamos manipulando esta requisição para evitar loop
      const isProcessed = request.cookies.get('processed_request')?.value
      if (isProcessed) {
        return response
      }

      // Mantém o pathname original, mas adiciona o subdomínio como primeiro segmento
      url.pathname =
        url.pathname === '/' ? `/${subdomain}` : `/${subdomain}${url.pathname}`
    }
  }

  if (subdomain) {
    // Define um cookie para armazenar a loja acessada
    response.cookies.set(`public_store_subdomain`, subdomain, { path: '/' })

    // Marca esta requisição como já processada para evitar loops
    response.cookies.set('processed_request', 'true', {
      path: '/',
      maxAge: 5, // Expira em 5 segundos para não afetar navegações futuras
      httpOnly: true,
    })

    return NextResponse.rewrite(url, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
