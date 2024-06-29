'use server'

import { createClient } from '@/lib/supabase/server'
import { UserType } from '@/models/user'
import { redirect } from 'next/navigation'

export async function createStore(name: string): Promise<{
  store: UserType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)

    redirect('/admin/sign-in')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert([{ user_id: session.user.id, name }])
    .single()

  return { store, storeError }
}

export async function updateStore(columns: any): Promise<{
  store: UserType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)

    redirect('/admin/sign-in')
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .update(columns)
    .eq('user_id', session.user?.id)

  return { store, storeError }
}
