import { adminAuthCallback } from '@/app/admin/(auth)/sign-in/actions'
import { createOpenApiServerActionRouter } from 'zsa-openapi'

export const adminSubscriptionsRouter = createOpenApiServerActionRouter({
  pathPrefix: '/api/v1/admin/subscriptions',
  defaults: {
    tags: ['Admin Subscriptions'],
  },
}).post('/create', adminAuthCallback)
