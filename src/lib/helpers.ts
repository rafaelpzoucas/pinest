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
  console.log('[extractSubdomainOrDomain] === INICIO DA EXECUÇÃO ===')

  const headersList = headers()
  const host = headersList.get('host') || ''
  const pathname = headersList.get('x-pathname') || '/'

  console.log('[extractSubdomainOrDomain] Headers capturados:', {
    host: host || 'VAZIO',
    pathname: pathname || 'VAZIO',
    allHeaders: Object.fromEntries(headersList.entries()),
  })

  const normalizedHost = normalizeHost(host)
  console.log('[extractSubdomainOrDomain] Host normalizado:', {
    original: host,
    normalized: normalizedHost,
  })

  if (!isTrustedHost(host)) {
    console.warn('[extractSubdomainOrDomain] ❌ Host não confiável:', host)
    console.log('[extractSubdomainOrDomain] === FIM (HOST_NOT_TRUSTED) ===')
    return null
  }
  console.log('[extractSubdomainOrDomain] ✅ Host confiável verificado')

  const isStaging = isTrustedStagingHost(host)
  console.log('[extractSubdomainOrDomain] Verificação staging:', {
    host,
    isStaging,
  })

  if (!isStaging && isSubdomainOfRoot(host)) {
    console.log(
      '[extractSubdomainOrDomain] 🔍 Processando como subdomínio do root',
    )
    const parts = host.replace(`.${ROOT_DOMAIN}`, '').split('.')
    console.log('[extractSubdomainOrDomain] Subdomain parts:', {
      originalHost: host,
      rootDomain: ROOT_DOMAIN,
      afterReplace: host.replace(`.${ROOT_DOMAIN}`, ''),
      parts,
      partsLength: parts.length,
    })

    if (parts.length === 1) {
      console.log(
        '[extractSubdomainOrDomain] ✅ Retornando subdomínio:',
        parts[0],
      )
      console.log('[extractSubdomainOrDomain] === FIM (SUBDOMAIN) ===')
      return parts[0]
    } else {
      console.log(
        '[extractSubdomainOrDomain] ⚠️ Múltiplas partes no subdomínio, continuando...',
      )
    }
  } else {
    console.log(
      '[extractSubdomainOrDomain] ⏭️ Pulando verificação de subdomínio:',
      {
        isStaging,
        isSubdomainOfRoot: !isStaging
          ? isSubdomainOfRoot(host)
          : 'N/A (staging)',
      },
    )
  }

  const isCustomDomain = isCustomDomainMapped(host)
  console.log('[extractSubdomainOrDomain] Verificação custom domain:', {
    host,
    normalizedHost,
    isCustomDomain,
    availableMappings: Object.keys(CUSTOM_DOMAIN_MAP),
  })

  if (isCustomDomain) {
    const mappedValue = CUSTOM_DOMAIN_MAP[normalizedHost]
    console.log('[extractSubdomainOrDomain] ✅ Custom domain encontrado:', {
      host,
      normalizedHost,
      mappedValue,
    })
    console.log('[extractSubdomainOrDomain] === FIM (CUSTOM_DOMAIN) ===')
    return mappedValue
  }

  console.log(
    '[extractSubdomainOrDomain] 🔍 Processando pathname como fallback',
  )
  const segments = pathname.split('/').filter(Boolean)
  console.log('[extractSubdomainOrDomain] Pathname segments:', {
    originalPathname: pathname,
    segments,
    segmentsLength: segments.length,
    firstSegment: segments[0] || 'NENHUM',
  })

  if (segments.length > 0) {
    console.log(
      '[extractSubdomainOrDomain] ✅ Retornando primeiro segment:',
      segments[0],
    )
    console.log('[extractSubdomainOrDomain] === FIM (PATHNAME_SEGMENT) ===')
    return segments[0]
  }

  console.log(
    '[extractSubdomainOrDomain] ❌ Nenhuma condição atendida, retornando null',
  )
  console.log('[extractSubdomainOrDomain] === FIM (NULL) ===')
  return null
}
