import { StoreType } from '@/models/store'
import { cookies } from 'next/headers'
import { createServerActionProcedure } from 'zsa'
import { createClient } from './supabase/server'

export const authenticatedProcedure = createServerActionProcedure().handler(
  async () => {
    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    return { user, supabase }
  },
)

export const adminProcedure = createServerActionProcedure(
  authenticatedProcedure,
).handler(async ({ ctx }) => {
  const { user, supabase } = ctx

  const { data, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || data.role !== 'admin') {
    throw new Error('User is not an admin')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (storeError || !store) {
    throw new Error('User does not have a store')
  }

  return {
    supabase,
    user,
    store,
  }
})

export const cashProcedure = createServerActionProcedure(
  adminProcedure,
).handler(async ({ ctx }) => {
  const { user, store, supabase } = ctx

  const { data: cashSession, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('store_id', store.id)
    .eq('user_id', user.id)
    .eq('status', 'open')
    .single()

  if (error || !cashSession) {
    console.error('Cash session is not open:', error)
  }

  return { cashSession, user, store, supabase }
})

export const storeProcedure = createServerActionProcedure().handler(
  async () => {
    const supabase = createClient()
    const cookieStore = cookies()
    const subdomainCookie = cookieStore.get('public_store_subdomain')?.value

    console.log('storeProcedure debug:', {
      subdomainCookie,
      allCookies: Array.from(cookieStore.getAll()).map((c) => ({
        name: c.name,
        value: c.value,
      })),
    })

    if (!subdomainCookie) {
      console.error(
        'Nenhuma loja identificada - cookie public_store_subdomain não encontrado.',
      )
      return { store: null, supabase, cookieStore }
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select(
        `
          *,
          store_hours (*),
          market_niches (*),
          addresses (*)
        `,
      )
      .eq('store_subdomain', subdomainCookie)
      .single()

    if (error) {
      console.error('Erro ao buscar dados da loja:', error)
      return { store: null, supabase, cookieStore }
    }

    if (!store) {
      console.error('Loja não encontrada para subdomain:', subdomainCookie)
      return { store: null, supabase, cookieStore }
    }

    console.log('storeProcedure store debug:', {
      storeSubdomain: store?.store_subdomain,
      storeName: store?.name,
    })

    return { store: store as StoreType, supabase, cookieStore }
  },
)
