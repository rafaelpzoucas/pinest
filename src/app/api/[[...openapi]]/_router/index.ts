import { createOpenApiServerActionRouter } from 'zsa-openapi'
import { adminAuthRouter } from './admin/auth'
import { adminCategoriesRouter } from './admin/categories'
import { adminCustomersRouter } from './admin/customers'
import { adminExtrasRouter } from './admin/extras'
import { adminObservationsRouter } from './admin/observations'
import { adminProductsRouter } from './admin/products'
import { adminShippingRouter } from './admin/shipping'
import { adminSubscriptionsRouter } from './admin/subscriptions'
import { cartRouter } from './cart'

export const router = createOpenApiServerActionRouter({
  extend: [
    adminSubscriptionsRouter,
    adminAuthRouter,
    adminCategoriesRouter,
    adminExtrasRouter,
    adminObservationsRouter,
    adminProductsRouter,
    adminShippingRouter,
    adminCustomersRouter,
    cartRouter,
  ],
})
