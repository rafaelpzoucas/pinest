import { headers } from 'next/headers'

export const STAGING_HOSTS = [
  'localhost:3000',
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
]
export const ROOT_DOMAIN = 'pinest.com.br'

function isTrustedHost(host: string): boolean {
  return (
    STAGING_HOSTS.includes(host) ||
    host.endsWith(`.${ROOT_DOMAIN}`) ||
    host === ROOT_DOMAIN
  )
}

export function extractSubdomain(): string | null {
  const headersList = headers()
  const host = headersList.get('host') || ''

  if (!isTrustedHost(host)) {
    console.warn('Untrusted host:', host)
    return null
  }

  const pathname = headersList.get('x-pathname') || '/'

  const isStaging = STAGING_HOSTS.includes(host)

  if (!isStaging && host.endsWith(ROOT_DOMAIN)) {
    const parts = host.replace(`.${ROOT_DOMAIN}`, '').split('.')
    if (parts.length === 1) return parts[0]
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) return segments[0]

  return null
}
