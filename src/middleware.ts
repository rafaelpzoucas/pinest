import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Primeiro aplicamos a lógica de autenticação do Supabase
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  // Verifica se estamos processando recursos estáticos que devem ser ignorados
  if (
    url.pathname.includes('/_next') ||
    url.pathname.includes('/favicon.ico') ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return response
  }

  // Ignora rotas que começam com /admin ou /api
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    // Redireciona /admin para /admin/dashboard apenas se for exatamente /admin
    if (url.pathname === '/admin') {
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    return response
  }

  // Lógica específica para ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    // Em ambiente local, o subdomínio é extraído do caminho (localhost:3000/nomedaloja)
    const segments = url.pathname.split('/').filter(Boolean)
    const subdomain = segments[0] || null

    if (subdomain) {
      // Remove o primeiro segmento (nome da loja) e mantém o resto do caminho
      const remainingPath = segments.slice(1).join('/')
      url.pathname = remainingPath
        ? `/${subdomain}/${remainingPath}`
        : `/${subdomain}`

      // Define um cookie para armazenar a loja acessada
      response.cookies.set(`public_store_subdomain`, subdomain, { path: '/' })
      return NextResponse.rewrite(url, response)
    }
    return response
  }
  // Lógica para ambiente de produção
  else {
    // APENAS remover www. se presente, com redirecionamento permanente
    if (hostname.startsWith('www.')) {
      const newHostname = hostname.replace('www.', '')
      const newUrl = url.clone()
      newUrl.hostname = newHostname
      return NextResponse.redirect(newUrl, { status: 301 })
    }

    // Captura o subdomínio apenas se não for o domínio principal (pinest.com.br)
    const parts = hostname.split('.')
    if (parts.length > 2) {
      const subdomain = parts[0]

      // Define um cookie para armazenar a loja acessada
      response.cookies.set(`public_store_subdomain`, subdomain, { path: '/' })

      // Em vez de reescrever a URL, vamos redirecionar para a página correta do subdomínio
      // com o parâmetro no path que o Next.js espera
      if (
        hostname !== 'pinest.com.br' &&
        !url.pathname.startsWith(`/${subdomain}`)
      ) {
        const newPathname =
          url.pathname === '/'
            ? `/${subdomain}`
            : `/${subdomain}${url.pathname}`
        url.pathname = newPathname
        return NextResponse.rewrite(url, response)
      }
    }

    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
