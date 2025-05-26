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

    // Protege contra www ou outros subdomínios inválidos
    if (subdomain && subdomain !== 'www' && subdomain !== 'pinest') {
      const pathname = nextUrl.pathname === '/' ? '' : nextUrl.pathname

      const url = request.nextUrl.clone()
      url.pathname = `/${subdomain}${pathname}`

      return NextResponse.rewrite(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    // ignora arquivos estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
