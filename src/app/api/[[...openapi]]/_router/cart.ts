import { addToCart, readCart } from '@/actions/cart'
import { createOpenApiServerActionRouter } from 'zsa-openapi'

export const cartRouter = createOpenApiServerActionRouter({
  pathPrefix: '/api/v1/cart',
  defaults: {
    tags: ['Cart'],
  },
})
  .get('/', readCart)
  .post('/add', addToCart)
