import { createOpenApiServerActionRouter } from 'zsa-openapi'
import { cartRouter } from './cart'
import { storeCustomersRouter } from './store-customers'

export const router = createOpenApiServerActionRouter({
  extend: [cartRouter, storeCustomersRouter],
})
