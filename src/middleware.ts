import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const IGNORED_HOSTS = ['localhost:3000', 'pinest.com.br']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const { nextUrl, headers } = request
  const hostname = headers.get('host') || ''
  const isIgnored = IGNORED_HOSTS.includes(hostname)

  if (!isIgnored) {
    const subdomain = hostname.split('.')[0]

    // Protege contra www ou subdomínios inválidos
    if (subdomain && subdomain !== 'www' && subdomain !== 'pinest') {
      const pathname = nextUrl.pathname === '/' ? '' : nextUrl.pathname

      const rewrittenUrl = request.nextUrl.clone()
      rewrittenUrl.pathname = `/${subdomain}${pathname}`

      const res = NextResponse.rewrite(rewrittenUrl)

      // Seta o cookie com o subdomínio para ser usado no servidor
      res.cookies.set('public_store_subdomain', subdomain, {
        path: '/',
        httpOnly: false, // se quiser acessar do client também
      })

      return res
    }
  }

  // mesmo se não fizer rewrite, salva um cookie nulo para evitar estado antigo
  const res = response || NextResponse.next()
  res.cookies.set('public_store_subdomain', '', {
    path: '/',
    maxAge: 0, // remove o cookie se não for subdomínio válido
  })

  return res
}

export const config = {
  matcher: [
    // ignora arquivos estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
