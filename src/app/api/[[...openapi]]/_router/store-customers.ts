import {
  createStoreCustomer,
  readStoreCustomers,
} from '@/actions/store/customers'
import { createOpenApiServerActionRouter } from 'zsa-openapi'

export const storeCustomersRouter = createOpenApiServerActionRouter({
  pathPrefix: '/api/v1/store',
  defaults: {
    tags: ['Store customers'],
  },
})
  .get('/customers', readStoreCustomers)
  .post('/customers/create', createStoreCustomer)
