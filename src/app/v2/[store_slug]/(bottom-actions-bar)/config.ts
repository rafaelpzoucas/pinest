import { BottomActionConfig } from './types'

export const bottomActionConfig: Record<string, BottomActionConfig> = {
  // Páginas de produto - mostra AddToCart e carrinho
  '/v2/[store_slug]/[product_slug]': {
    showCart: true,
    showAddToCart: true,
    showFinishOrder: false,
    variant: 'default',
  },

  // Páginas de categoria/busca - só carrinho
  '/v2/[store_slug]': {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
    variant: 'default',
  },

  // Só finish order
  '/v2/[store_slug]/cart': {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: true,
  },

  // Páginas onde não queremos mostrar
  '/v2/[store_slug]/account': {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: false,
  },
  '/v2/[store_slug]/account/register': {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: false,
  },
  '/v2/[store_slug]/checkout': {
    showCart: false,
    showAddToCart: false,
    showFinishOrder: true,
  },

  // Configuração padrão
  '*': {
    showCart: true,
    showAddToCart: false,
    showFinishOrder: false,
    variant: 'default',
  },
}
