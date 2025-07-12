import { StoreType } from '@/models/store'
import { cookies } from 'next/headers'
import { createServerActionProcedure } from 'zsa'
import { extractSubdomain } from './helpers'
import { createClient } from './supabase/server'

export const authenticatedProcedure = createServerActionProcedure().handler(
  async () => {
    console.time('getPublicProducts')

    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }
    console.timeEnd('getPublicProducts')
    return { user, supabase }
  },
)

export const adminProcedure = createServerActionProcedure(
  authenticatedProcedure,
).handler(async ({ ctx }) => {
  console.time('getPublicProducts')
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
  console.timeEnd('getPublicProducts')

  return {
    supabase,
    user,
    store,
  }
})

export const cashProcedure = createServerActionProcedure(
  adminProcedure,
).handler(async ({ ctx }) => {
  console.time('getPublicProducts')
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
  console.timeEnd('getPublicProducts')

  return { cashSession, user, store, supabase }
})

export const storeProcedure = createServerActionProcedure().handler(
  async () => {
    console.time('getPublicProducts')
    const supabase = createClient()
    const subdomain = extractSubdomain()
    const cookieStore = cookies()

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
    console.timeEnd('getPublicProducts')
    return { store: store as StoreType, supabase, cookieStore }
  },
)
