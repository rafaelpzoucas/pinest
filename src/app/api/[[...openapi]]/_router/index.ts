import { createOpenApiServerActionRouter } from 'zsa-openapi'
import { adminCategoriesRouter } from './admin/categories'
import { adminCustomersRouter } from './admin/customers'
import { adminExtrasRouter } from './admin/extras'
import { adminObservationsRouter } from './admin/observations'
import { adminProductsRouter } from './admin/products'
import { adminShippingRouter } from './admin/shipping'
import { cartRouter } from './cart'

export const router = createOpenApiServerActionRouter({
  extend: [
    adminCategoriesRouter,
    adminProductsRouter,
    adminExtrasRouter,
    adminObservationsRouter,
    adminShippingRouter,
    cartRouter,
    adminCustomersRouter,
  ],
})
