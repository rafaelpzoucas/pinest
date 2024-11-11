# Pinest

Pinest é uma plataforma SaaS focada em facilitar a criação e gestão de lojas virtuais para usuários leigos, priorizando simplicidade, design atrativo e experiência otimizada. A proposta central é oferecer uma solução para lojistas que buscam agilidade e praticidade, sem a necessidade de customizações complexas, com todos os recursos essenciais para vender online prontos desde o cadastro.

## Tecnologias e Ferramentas Utilizadas

### Frontend
- **Next.js**: Estrutura base do projeto, utilizando Server Actions para operações no servidor.
- **React com TypeScript**: Desenvolvimento de componentes e gerenciamento de tipagens.
- **ShadCN UI** e **React Hook Form**: Usados para formular e validar os formulários da plataforma.
- **date-fns**: Manipulação e formatação de datas, especialmente para o cadastro de horários de atendimento das lojas.

### Backend e Banco de Dados
- **Supabase**: Gerenciamento de dados de produtos, lojas e pedidos, com suporte a autenticação.
- **Stripe API**: Para gerenciar pagamentos e processar vendas diretamente para contas conectadas, possibilitando pagamentos com cartões aceitos.
- **Kangu API**: Integração de opções de frete para envios por transportadoras e cálculo de prazos e custos.

### Funcionalidades
- **Organização de Layout**: Possibilidade de organização dos elementos visuais da loja e showcases com recurso de arrastar e soltar.
- **Opções de Frete Personalizadas**: Configuração de envios locais e integração com transportadoras através da Kangu.

## Configuração e Inicialização do Projeto

Para rodar o projeto Pinest em ambiente local, siga os passos abaixo.

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Supabase**: Configure uma instância no [Supabase](https://supabase.io/) e insira as credenciais no arquivo `.env.local`.
- **Stripe**: Cadastre-se no [Stripe](https://stripe.com/) e configure uma conta conectada, inserindo as chaves de API no arquivo `.env.local`.
- **Kangu**: Cadastre-se na [Kangu](https://www.portal.kangu.com.br/login) e configure a API.

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
MELHOR_ENVIO_API_KEY=your_melhor_envio_key
```

### Instalação

Instale as dependências com o seguinte comando:

```bash
npm install
```

### Rodando o Servidor de Desenvolvimento

Inicie o servidor de desenvolvimento com:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para visualizar o projeto.

### Estrutura do Código

O projeto segue a estrutura padrão do Next.js com os seguintes pontos de destaque:
- `app/page.tsx`: Página principal, onde o layout da plataforma é renderizado.
- `components/`: Componentes reutilizáveis, organizados com suas ações no arquivo `actions.ts`.
- `lib/`: Configurações de API, incluindo Supabase, Stripe e Melhor Envio.

## Deployment

A forma recomendada de fazer o deploy da Pinest é pela [Vercel](https://vercel.com/) para Next.js, com instruções disponíveis na [documentação oficial](https://nextjs.org/docs/deployment).

---

Para contribuir ou relatar problemas, sinta-se à vontade para abrir issues e enviar pull requests!
