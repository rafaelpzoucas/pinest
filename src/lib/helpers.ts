import { createClient } from '@/lib/supabase/server'
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

// Agora verificamos também no Supabase se é um domínio customizado registrado
async function isTrustedHost(host: string): Promise<boolean> {
  if (isTrustedStagingHost(host)) return true

  const supabase = createClient()
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('custom_domain', host)
    .maybeSingle()

  return Boolean(data) && !error
}

export async function extractSubdomainOrDomain(): Promise<string | null> {
  const headersList = headers()
  const host = headersList.get('host') || ''
  const pathname = headersList.get('x-pathname') || '/'

  const trusted = await isTrustedHost(host)
  if (!trusted) {
    console.warn('Untrusted host:', host)
    return null
  }

  const isStaging = isTrustedStagingHost(host)

  if (!isStaging && isSubdomainOfRoot(host)) {
    const parts = host.replace(`.${ROOT_DOMAIN}`, '').split('.')
    if (parts.length === 1) return parts[0] // subdomínio válido
  }

  // Se for domínio customizado, retornamos o próprio host
  if (!isSubdomainOfRoot(host) && !STAGING_HOSTS.includes(host)) {
    const normalizedHost = normalizeHost(host)
    return normalizeHost(normalizedHost)
  }

  // fallback para rota de pathname, se estiver em staging
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) return segments[0]

  return null
}
