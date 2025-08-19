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
    variant: 'background',
    title: 'Carrinho',
  },
  '/v2/[store_slug]/account': {
    showBackButton: true,
    variant: 'background',
    title: 'Minha conta',
  },
  '/v2/[store_slug]/account/register': {
    showBackButton: true,
    variant: 'background',
    title: 'Minha conta',
  },
  '/v2/[store_slug]/checkout': {
    showBackButton: true,
    variant: 'background',
    title: 'Finalizar pedido',
  },
  '/v2/[store_slug]/orders': {
    showBackButton: true,
    variant: 'background',
    title: 'Meus pedidos',
  },
  '/v2/[store_slug]/orders/[id]': {
    showBackButton: true,
    variant: 'background',
    title: 'Meus pedidos',
  },
  // Configuração padrão para rotas não especificadas
  '*': {
    showBackButton: true,
    variant: 'default',
  },
}
