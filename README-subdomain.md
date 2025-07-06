# Sistema de Subdomínios - Pinest

## 🎯 Objetivo

Implementar um sistema onde `nomedaloja.pinest.com.br` mostra o conteúdo de `pinest.com.br/nomedaloja/` mas mantém a URL original.

## ✅ Implementação Concluída

### Arquivos Modificados:

1. **`src/middleware.ts`** - Captura subdomínios e define cookies
2. **`next.config.mjs`** - Configura rewrites para redirecionamento
3. **`src/lib/zsa-procedures.ts`** - Melhorado tratamento de erros
4. **`src/app/[public_store]/actions.ts`** - Atualizado para novo retorno
5. **`src/app/[public_store]/layout.tsx`** - Melhorado tratamento de erro

### Arquivos Criados:

1. **`docs/subdomain-system.md`** - Documentação técnica
2. **`scripts/test-subdomain.js`** - Script de teste
3. **`src/app/test-subdomain/page.tsx`** - Página de debug

## 🧪 Como Testar

### 1. Teste Local (Desenvolvimento)

```bash
# Inicie o servidor
npm run dev

# Em outro terminal, teste um subdomínio
node scripts/test-subdomain.js minhaloja

# Ou acesse diretamente no navegador
http://localhost:3000/minhaloja
```

### 2. Teste de Debug

Acesse `http://localhost:3000/test-subdomain` para ver informações de debug.

### 3. Teste em Produção

Quando deployado, acesse `minhaloja.pinest.com.br` (substitua "minhaloja" pelo nome real da loja).

## 🔧 Como Funciona

### Fluxo Completo:

1. **Usuário acessa:** `minhaloja.pinest.com.br`
2. **Middleware captura:** "minhaloja" e define cookie
3. **Rewrite redireciona:** para `/[public_store]/`
4. **Store procedure:** busca dados da loja "minhaloja"
5. **Layout renderiza:** conteúdo da loja
6. **URL permanece:** `minhaloja.pinest.com.br`

### Em Desenvolvimento:

- `localhost:3000/minhaloja` → simula `minhaloja.pinest.com.br`
- Cookie `public_store_subdomain = "minhaloja"`

### Em Produção:

- `minhaloja.pinest.com.br` → URL real
- Cookie `public_store_subdomain = "minhaloja"`

## 🐛 Troubleshooting

### Loja não encontrada:
1. Verifique se o subdomínio existe no banco de dados
2. Verifique os logs do console para erros do middleware
3. Use a página de debug: `localhost:3000/test-subdomain`

### Middleware não executando:
1. Verifique se o matcher está correto
2. Reinicie o servidor após mudanças
3. Verifique logs no console

### Rewrites não funcionando:
1. Verifique `next.config.mjs`
2. Reinicie o servidor
3. Limpe cache do navegador

## 📝 Logs Importantes

O sistema gera logs detalhados para debug:

```
Middleware executando para: { hostname: 'localhost', pathname: '/minhaloja' }
Middleware: Subdomínio detectado em staging/dev: minhaloja
Middleware: Cookie definido para subdomain: minhaloja
storeProcedure debug: { subdomainCookie: 'minhaloja' }
```

## 🚀 Próximos Passos

1. **Teste em produção** com domínio real
2. **Configure DNS** para apontar subdomínios para o servidor
3. **Monitore logs** para identificar problemas
4. **Teste com múltiplas lojas** simultaneamente

## 📚 Documentação Adicional

Veja `docs/subdomain-system.md` para documentação técnica detalhada. 