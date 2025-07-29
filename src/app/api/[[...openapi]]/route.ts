import { createRouteHandlers } from 'zsa-openapi'
import { router } from './_router'

export const { GET, POST, PUT, DELETE } = createRouteHandlers(router, {
  shapeError: (error) => ({
    code: error.code,
    message: error.message,
  }),
})
