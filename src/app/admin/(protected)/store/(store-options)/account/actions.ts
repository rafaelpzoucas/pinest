'use server'

import { createClient } from '@/lib/supabase/server'
import { StoreType } from '@/models/store'
import { UserType } from '@/models/user'

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
        addresses (*)
      `,
    )
    .eq('user_id', session.user?.id)
    .single()

  return { store, storeError }
}
