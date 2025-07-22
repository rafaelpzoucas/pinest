import { createClient } from '@/lib/supabase/client'
import { StoreType } from '@/models/store'

export const STAGING_HOSTS = [
  'localhost:3000',
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
  'pinest.onrender.com',
]
export const ROOT_DOMAIN = 'pinest.com.br'

function isTrustedHost(host: string): boolean {
  return (
    STAGING_HOSTS.includes(host) ||
    host.endsWith(`.${ROOT_DOMAIN}`) ||
    host === ROOT_DOMAIN
  )
}

function extractSubdomainClient(): string | null {
  if (typeof window === 'undefined') return null

  const host = window.location.host
  const pathname = window.location.pathname

  if (!isTrustedHost(host)) {
    console.warn('Untrusted host:', host)
    return null
  }

  const isStaging = STAGING_HOSTS.includes(host)

  if (!isStaging && host.endsWith(ROOT_DOMAIN)) {
    const parts = host.replace(`.${ROOT_DOMAIN}`, '').split('.')
    if (parts.length === 1) return parts[0]
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) return segments[0]

  return null
}

export async function readStoreData() {
  const supabase = createClient()
  const subdomain = extractSubdomainClient()

  if (!subdomain) {
    console.error('Nenhuma loja identificada.')
    return null
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select(`*, store_hours (*), market_niches (*), addresses (*)`)
    .eq('store_subdomain', subdomain)
    .single()

  if (error) {
    console.error('Erro ao buscar dados da loja.', error)
  }

  return { store: store as StoreType }
}
