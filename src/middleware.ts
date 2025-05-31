import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// ✅ Executa updateSession para manter a sessão do Supabase atualizada

// ✅ Ignora o middleware se o host for:
//    - localhost:3000
//    - pinest.com.br

// ✅ Ignora o middleware se o path começar com:
//    - /admin
//    - /api

// ✅ Extrai o subdomínio do host (ex: 'sanduba' em 'sanduba.pinest.com.br')

// ✅ Valida o subdomínio (ignora 'www')

// ✅ Reescreve a URL para incluir o subdomínio como prefixo no path:
//    - Ex: sanduba.pinest.com.br/menu → pinest.com.br/sanduba/menu
//    - A URL visível no navegador continua sendo sanduba.pinest.com.br/menu

// ✅ Define um cookie chamado 'public_store_subdomain' com o valor do subdomínio:
//    - path: '/'
//    - httpOnly: false (acessível pelo client)

// ✅ Middleware só é executado em rotas que não são:
//    - Arquivos estáticos (_next/static, _next/image, favicon.ico)
//    - Arquivos de imagem (.svg, .png, .jpg, etc.)
