import {
  createOpenApiServerActionRouter,
  createRouteHandlers,
} from 'zsa-openapi'

const router = createOpenApiServerActionRouter({
  pathPrefix: '/api/v1',
})

export const { GET, POST, PUT, DELETE } = createRouteHandlers(router)
