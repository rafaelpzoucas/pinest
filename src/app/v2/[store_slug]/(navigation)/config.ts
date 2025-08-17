import { NavigationConfig } from './types'

export const navigationConfig: Record<string, NavigationConfig> = {
  '/v2/[store_slug]': {
    showBackButton: false,
    variant: 'default',
  },
  '/v2/[store_slug]/[product_slug]': {
    showBackButton: true,
    variant: 'default',
  },
  '/v2/[store_slug]/cart': {
    showBackButton: true,
    variant: 'default',
    title: 'Carrinho',
  },
  '/v2/[store_slug]/account': {
    showBackButton: true,
    variant: 'default',
    title: 'Minha conta',
  },
  '/v2/[store_slug]/account/register': {
    showBackButton: true,
    variant: 'default',
    title: 'Minha conta',
  },
  '/v2/[store_slug]/checkout': {
    showBackButton: true,
    variant: 'default',
    title: 'Finalizar pedido',
  },
  // Configuração padrão para rotas não especificadas
  '*': {
    showBackButton: true,
    variant: 'default',
  },
}
