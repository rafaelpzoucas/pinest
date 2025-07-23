import { createClient } from '@/lib/supabase/client'
import { StoreType } from '@/models/store'

// Hosts que podem ser usados em ambiente de staging ou dev
export const STAGING_HOSTS = [
  'localhost:3000',
  'staging.pinest.com.br',
  'staging-pinest.vercel.app',
  'pinest.onrender.com',
]

export const ROOT_DOMAIN = 'pinest.com.br'

function isStagingHost(host: string): boolean {
  return STAGING_HOSTS.includes(host)
}

function isSubdomainOfRoot(host: string): boolean {
  return host.endsWith(`.${ROOT_DOMAIN}`)
}

async function extractStoreByHost(): Promise<StoreType | null> {
  if (typeof window === 'undefined') return null

  const host = window.location.host
  const supabase = createClient()

  if (isStagingHost(host) || isSubdomainOfRoot(host)) {
    const subdomain = host.replace(`.${ROOT_DOMAIN}`, '').split('.')[0]

    if (!subdomain) {
      console.warn('Subdomínio inválido:', host)
      return null
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select(`*, store_hours (*), market_niches (*), addresses (*)`)
      .eq('store_subdomain', subdomain)
      .single()

    if (error) {
      console.error('Erro ao buscar loja por subdomínio:', error)
      return null
    }

    return store as StoreType
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select(`*, store_hours (*), market_niches (*), addresses (*)`)
    .eq('custom_domain', host)
    .single()

  if (error) {
    console.error('Erro ao buscar loja por domínio personalizado:', error)
    return null
  }

  return store as StoreType
}

export async function readStoreData() {
  const store = await extractStoreByHost()

  if (!store) {
    console.error('Nenhuma loja identificada.')
    return null
  }

  return { store }
}
