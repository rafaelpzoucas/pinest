import { NavigationConfig } from './types'

export const navigationConfig: Record<string, NavigationConfig> = {
  '/[store_slug]': {
    showBackButton: false,
    variant: 'default',
  },
  '/[store_slug]/[product_slug]': {
    showBackButton: true,
    variant: 'default',
  },
  '/[store_slug]/cart': {
    showBackButton: true,
    variant: 'background',
    title: 'Carrinho',
  },
  '/[store_slug]/account': {
    showBackButton: true,
    variant: 'background',
    title: 'Minha conta',
  },
  '/[store_slug]/account/register': {
    showBackButton: true,
    variant: 'background',
    title: 'Minha conta',
  },
  '/[store_slug]/checkout': {
    showBackButton: true,
    variant: 'background',
    title: 'Finalizar pedido',
  },
  '/[store_slug]/orders': {
    showBackButton: true,
    variant: 'background',
    title: 'Meus pedidos',
  },
  '/[store_slug]/orders/[id]': {
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
