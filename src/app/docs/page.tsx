import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { generateOpenApiDocument } from 'zsa-openapi'
import { router } from '../api/[[...openapi]]/_router'

export default async function DocsPage() {
  const spec = await generateOpenApiDocument(router, {
    title: 'Pinest API',
    version: '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  })

  return <SwaggerUI spec={spec} />
}
