'use server'

import { createClient } from '@/lib/supabase/server'
import { HourType } from '@/models/hour'
import { SocialMediaType } from '@/models/social'
import { StoreType } from '@/models/store'
import { UserType } from '@/models/user'
import { redirect } from 'next/navigation'

export async function readUser(): Promise<{
  data: UserType | null
  error: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data, error } = await supabase
    .from('users')
    .select(
      `
      *,
      stores (
        * 
      )
    `,
    )
    .eq('id', session.user?.id)
    .single()
  return { data, error }
}

export async function readStoreByUserId(): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select(
      `
        *,
        market_niches (*),
        addresses (*)
      `,
    )
    .eq('user_id', session.user?.id)
    .single()

  return { store, storeError }
}

export async function signUserOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
  }

  return redirect('/admin/sign-in')
}

export async function readStoreByStoreURL(storeURL: string) {
  const supabase = createClient()

  const { data: store, error: readStoreError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_url', storeURL)
    .single()

  return { store, readStoreError }
}

export async function readStoreSocials(storeURL: string): Promise<{
  socials: SocialMediaType[] | null
  readSocialsError: any | null
}> {
  const supabase = createClient()

  const { store } = await readStoreByStoreURL(storeURL)

  const { data: socials, error: readSocialsError } = await supabase
    .from('store_socials')
    .select('*')
    .eq('store_id', store.id)

  return { socials, readSocialsError }
}

export async function readStoreHours(storeURL: string): Promise<{
  hours: HourType[] | null
  readHoursError: any | null
}> {
  const supabase = createClient()

  const { store } = await readStoreByStoreURL(storeURL)

  const { data: hours, error: readHoursError } = await supabase
    .from('store_hours')
    .select('*')
    .eq('store_id', store.id)

  if (readHoursError) {
    return { hours: null, readHoursError }
  }

  // Ordem dos dias da semana para referência
  const dayOrder = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  // Ordenar os horários com base na referência
  const sortedHours = hours?.sort(
    (a, b) => dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week),
  )

  return { hours: sortedHours, readHoursError: null }
}
