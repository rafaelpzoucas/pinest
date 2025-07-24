import { CUSTOM_DOMAIN_MAP } from '@/middleware'
import { headers } from 'next/headers'
import { normalizeHost } from './utils'

export const STAGING_HOSTS = [
  'localhost:3000',
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
  'pinest.onrender.com',
]

export const ROOT_DOMAIN = 'pinest.com.br'

function isSubdomainOfRoot(host: string): boolean {
  return host.endsWith(`.${ROOT_DOMAIN}`)
}

function isTrustedStagingHost(host: string): boolean {
  return (
    STAGING_HOSTS.includes(host) ||
    isSubdomainOfRoot(host) ||
    host === ROOT_DOMAIN
  )
}

function isCustomDomainMapped(host: string): boolean {
  const normalizedHost = normalizeHost(host)
  return Object.prototype.hasOwnProperty.call(CUSTOM_DOMAIN_MAP, normalizedHost)
}

function isTrustedHost(host: string): boolean {
  return isTrustedStagingHost(host) || isCustomDomainMapped(host)
}

export function extractSubdomainOrDomain(): string | null {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const pathname = headersList.get('x-pathname') || '/'

  if (!isTrustedHost(host)) {
    console.warn('Untrusted host:', host)
    return null
  }

  const normalizedHost = normalizeHost(host)
  const isStaging = isTrustedStagingHost(host)

  // Se for subdomínio do domínio raiz (ex: loja1.pinest.com.br)
  if (!isStaging && isSubdomainOfRoot(host)) {
    const parts = host.replace(`.${ROOT_DOMAIN}`, '').split('.')
    if (parts.length === 1) return parts[0]
  }

  // Se for domínio customizado
  if (isCustomDomainMapped(host)) {
    return CUSTOM_DOMAIN_MAP[normalizedHost]
  }

  // Se for um host de staging, tentar pegar o slug da URL (ex: /loja1/...)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) return segments[0]

  return null
}
