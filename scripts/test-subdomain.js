#!/usr/bin/env node

/**
 * Script para testar o sistema de subdomínios
 *
 * Uso:
 * node scripts/test-subdomain.js [subdomain]
 *
 * Exemplo:
 * node scripts/test-subdomain.js minhaloja
 */

import http from 'http'

const subdomain = process.argv[2] || 'teste'

console.log(`🧪 Testando subdomínio: ${subdomain}`)
console.log(`📍 URL: http://localhost:3000/${subdomain}`)
console.log('')

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/${subdomain}`,
  method: 'GET',
  headers: {
    'User-Agent': 'Subdomain-Test-Script/1.0',
  },
}

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`)
  console.log(`📋 Headers:`, res.headers)

  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    console.log('')
    console.log('📄 Resposta:')
    console.log('---')

    // Verifica se há cookies de subdomínio
    const cookies = res.headers['set-cookie']
    if (cookies) {
      const subdomainCookie = cookies.find((cookie) =>
        cookie.includes('public_store_subdomain'),
      )
      if (subdomainCookie) {
        console.log('✅ Cookie de subdomínio encontrado:', subdomainCookie)
      } else {
        console.log('❌ Cookie de subdomínio não encontrado')
      }
    } else {
      console.log('❌ Nenhum cookie encontrado')
    }

    // Verifica se a página contém conteúdo da loja
    if (data.includes('Loja não encontrada')) {
      console.log('❌ Página mostra "Loja não encontrada"')
    } else if (data.includes('store_subdomain')) {
      console.log('✅ Página contém dados da loja')
    } else {
      console.log('⚠️  Não foi possível determinar se a loja foi carregada')
    }

    console.log('---')
    console.log('')
    console.log('🎯 Teste concluído!')
  })
})

req.on('error', (e) => {
  console.error(`❌ Erro na requisição: ${e.message}`)
  console.log('')
  console.log(
    '💡 Certifique-se de que o servidor está rodando em localhost:3000',
  )
})

req.end()
