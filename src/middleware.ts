import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const hostname = request.nextUrl.hostname
  const url = request.nextUrl.clone()

  let subdomain: string | null = null

  if (process.env.NODE_ENV !== 'production') {
    // Em ambiente local, o subdomínio é extraído do caminho (localhost:3000/nomedaloja)
    const segments = url.pathname.split('/').filter(Boolean)
    subdomain = segments[0] || null
  } else {
    // Em produção, captura o subdomínio de "nomedaloja.pinest.com.br"
    const parts = hostname.split('.')
    if (parts.length > 2) {
      subdomain = parts[0]
    } else {
      // Se não houver subdomínio, tenta extrair do path
      const segments = url.pathname.split('/').filter(Boolean)
      subdomain = segments[0] || null
    }
  }

  if (subdomain) {
    // Define um cookie para armazenar a loja acessada
    response.cookies.set(`public_store_${subdomain}`, subdomain, { path: '/' })

    // Reescreve a URL para apontar para a rota da loja correspondente
    url.pathname = `/${subdomain}`
    return NextResponse.rewrite(url, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
