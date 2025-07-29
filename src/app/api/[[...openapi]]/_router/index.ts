import { createOpenApiServerActionRouter } from 'zsa-openapi'
import { cartRouter } from './cart'

export const router = createOpenApiServerActionRouter({
  extend: [cartRouter],
})
