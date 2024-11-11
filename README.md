# Pinest

Pinest é uma plataforma de marketplace desenvolvida para facilitar a criação e o gerenciamento de lojas online, focada em oferecer uma experiência de usuário simplificada e designs prontos para vender, ideal para quem quer começar a vender sem se preocupar com customizações complexas.

Este projeto utiliza [Next.js](https://nextjs.org/) como framework de frontend, com suporte para renderização híbrida e otimizações de performance.

## Tecnologias Utilizadas

- **Next.js** - Framework para React com suporte a renderização server-side e estática.
- **React** com **TypeScript** - Para desenvolvimento de interfaces fortemente tipadas.
- **Supabase** - Banco de dados e autenticação baseada em PostgreSQL para back-end e gerenciamento de dados.
- **Stripe** - Integração de pagamentos e sistema de checkout.
- **ShadCN UI** - Biblioteca de componentes estilizados para construção de formulários e interfaces.
- **React Hook Form** - Para gerenciamento de formulários.
- **date-fns** - Biblioteca de manipulação de datas.
- **pnpm** - Gerenciador de pacotes, preferido pela sua eficiência em instalações rápidas e compartilhamento de dependências.
- **Vercel** - Hospedagem e deploy do projeto, com suporte para SSR (Server-Side Rendering) e SSG (Static Site Generation).

## Iniciando o Projeto

### Pré-requisitos

Certifique-se de ter o Node.js e o `pnpm` instalados em seu sistema.

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/pinest.git
   cd pinest
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as credenciais necessárias para conectar ao Supabase e ao Stripe.

### Executando o Servidor de Desenvolvimento

Para rodar o projeto em modo de desenvolvimento, execute:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) em seu navegador para ver o projeto em ação.

### Estrutura do Projeto

- A página principal pode ser editada em `app/page.tsx`, e o projeto conta com hot reload para atualização automática das alterações.
- As ações do servidor (Server Actions) estão organizadas nos arquivos `actions.ts` de cada componente.

## Fontes e Otimização

O projeto utiliza [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) para otimização automática de fontes, incluindo a integração com fontes customizadas como a Google Font Inter.

## Recursos Adicionais

Para saber mais sobre Next.js e explorar mais recursos, confira:

- [Documentação do Next.js](https://nextjs.org/docs) - para detalhes sobre as funcionalidades e API.
- [Learn Next.js](https://nextjs.org/learn) - um tutorial interativo sobre Next.js.

## Deploy

O projeto Pinest é preparado para deploy na [Vercel](https://vercel.com/), que oferece uma integração completa com Next.js para SSR e SSG. Siga a [documentação de deploy](https://nextjs.org/docs/deployment) para mais detalhes.

--- 

Esse README fornece um panorama mais completo da Pinest, com informações úteis para instalação, tecnologias e configuração do ambiente de desenvolvimento com `pnpm`.
