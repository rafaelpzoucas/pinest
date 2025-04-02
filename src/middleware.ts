import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Primeiro, executa a lógica do updateSession
  const sessionResponse = await updateSession(request)

  if (sessionResponse) {
    return sessionResponse
  }

  // Captura o host (domínio acessado)
  const host = request.headers.get('host') || ''

  // Mapeamento de domínios personalizados para os caminhos na Pinest
  const domainMappings: Record<string, string> = {
    'sandubadaleyla.com.br': '/sanduba-da-leyla',
    'outrocliente.com.br': '/outro-cliente',
    // Adicione mais domínios conforme necessário
  }

  if (domainMappings[host]) {
    return NextResponse.rewrite(new URL(domainMappings[host], request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Mantém a mesma configuração anterior,
     * garantindo que o middleware seja aplicado a todas as rotas,
     * exceto arquivos estáticos e imagens.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
