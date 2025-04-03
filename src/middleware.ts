import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname

  let subdomain: string | null = null

  if (process.env.NODE_ENV !== 'production') {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null
  } else {
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
    } else {
      // Adiciona suporte para path como subdomínio em produção
      const segments = request.nextUrl.pathname.split('/').filter(Boolean)
      subdomain = segments[0] || null
    }
  }

  if (subdomain) {
    // Nome do cookie baseado no subdomínio
    response.cookies.set(`public_store_${subdomain}`, subdomain, { path: '/' })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
