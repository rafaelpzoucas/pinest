import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Atualiza a sessão primeiro
  const sessionResponse = await updateSession(request)
  if (sessionResponse) return sessionResponse

  // Obtém o domínio acessado pelo usuário
  const host = request.headers.get('host') || ''

  // Mapeamento de domínios para seus respectivos caminhos
  const domainMappings: Record<string, string> = {
    'sandubadaleyla.com.br': '/sanduba-da-leyla',
    'outrocliente.com.br': '/outro-cliente',
    // Adicione mais domínios conforme necessário
  }

  // Se o domínio existir no mapeamento, faz o rewrite para o caminho correto
  if (domainMappings[host]) {
    const url = request.nextUrl.clone()
    url.pathname = domainMappings[host] + url.pathname // Mantém o subcaminho
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
