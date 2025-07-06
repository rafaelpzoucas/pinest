# Sistema de Subdomínios - Pinest

## Como Funciona

O sistema permite que cada loja tenha seu próprio subdomínio no formato `nomedaloja.pinest.com.br`, que mostra o conteúdo da loja mas mantém a URL original.

## Configuração

### 1. Middleware (`src/middleware.ts`)

O middleware captura o subdomínio e define um cookie `public_store_subdomain` com o nome da loja.

**Em Produção:**
- `loja.pinest.com.br` → cookie `public_store_subdomain = "loja"`

**Em Desenvolvimento/Staging:**
- `localhost:3000/loja` → cookie `public_store_subdomain = "loja"`

### 2. Rewrites (`next.config.mjs`)

Os rewrites redirecionam as requisições para a pasta `[public_store]`:

```javascript
// Produção: foo.pinest.com.br/* → /[public_store]/*
{
  source: '/:path*',
  has: [
    {
      type: 'host',
      value: '(?!staging(?:-pinest)?.vercel.app|staging.pinest.com.br)(?<store>[^.]+).pinest.com.br',
    },
  ],
  destination: '/[public_store]/:path*',
}
```

### 3. Store Procedure (`src/lib/zsa-procedures.ts`)

O `storeProcedure` lê o cookie `public_store_subdomain` e busca os dados da loja no banco de dados.

### 4. Layout (`src/app/[public_store]/layout.tsx`)

O layout verifica se a loja existe e renderiza o conteúdo ou uma página de erro.

## Fluxo de Funcionamento

1. Usuário acessa `minhaloja.pinest.com.br`
2. Middleware captura "minhaloja" e define o cookie
3. Rewrite redireciona para `/[public_store]/`
4. Store procedure busca dados da loja "minhaloja"
5. Layout renderiza o conteúdo da loja
6. URL permanece como `minhaloja.pinest.com.br`

## Testes

### Em Produção
- Acesse `nomedaloja.pinest.com.br`
- Deve mostrar o conteúdo da loja
- URL deve permanecer como `nomedaloja.pinest.com.br`

### Em Desenvolvimento
- Acesse `localhost:3000/nomedaloja`
- Deve mostrar o conteúdo da loja
- URL deve permanecer como `localhost:3000/nomedaloja`

### Debug
- Acesse `localhost:3000/test-subdomain` para ver informações de debug
- Acesse `localhost:3000/nomedaloja/debug` para ver informações específicas da loja

## Troubleshooting

### Loja não encontrada
1. Verifique se o subdomínio existe no banco de dados
2. Verifique os logs do middleware
3. Verifique se o cookie está sendo definido corretamente

### Middleware não executando
1. Verifique se o matcher está correto
2. Verifique se não há conflitos com outros middlewares

### Rewrites não funcionando
1. Verifique a configuração no `next.config.mjs`
2. Verifique se o regex do host está correto
3. Reinicie o servidor após mudanças 