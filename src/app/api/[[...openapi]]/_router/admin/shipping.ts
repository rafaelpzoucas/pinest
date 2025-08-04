import { readAdminShippingServer } from '@/actions/admin/shipping'
import { createOpenApiServerActionRouter } from 'zsa-openapi'

export const adminShippingRouter = createOpenApiServerActionRouter({
  pathPrefix: '/api/v1/admin/shipping',
  defaults: {
    tags: ['Admin Shipping'],
  },
}).get('/', readAdminShippingServer)
