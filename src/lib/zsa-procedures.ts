import { StoreType } from '@/models/store'
import { cookies } from 'next/headers'
import { createServerActionProcedure } from 'zsa'

import { extractSubdomainOrDomain } from './helpers'
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

  // Refatorado: busca role e dados da loja em uma só query
  const { data, error } = await supabase
    .from('users')
    .select('role, stores(*, addresses(*))')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    throw new Error('User is not an admin or does not have a store')
  }

  if (data.role !== 'admin') {
    throw new Error('User is not an admin')
  }

  const store = Array.isArray(data.stores) ? data.stores[0] : data.stores
  if (!store) {
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
    const subdomainOrDomain = extractSubdomainOrDomain()
    const cookieStore = cookies()

    if (!subdomainOrDomain) {
      console.error('Nenhuma loja identificada.', subdomainOrDomain)
      return null
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select(`*, store_hours (*), market_niches (*), addresses (*)`)
      .or(
        `store_subdomain.eq.${subdomainOrDomain},custom_domain.eq.${subdomainOrDomain}`,
      )
      .single()

    if (error) {
      console.error('Erro ao buscar dados da loja.', error)
    }

    return { store: store as StoreType, supabase, cookieStore }
  },
)
