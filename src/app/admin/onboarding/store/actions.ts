'use server'

import { createClient } from '@/lib/supabase/server'
import { removeAccents } from '@/lib/utils'
import { UserType } from '@/models/user'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { storeFormSchema } from './form'

export async function createStore(
  columns: z.infer<typeof storeFormSchema>,
): Promise<{
  storeError: any | null
}> {
  const newColumns = {
    ...columns,
    name: columns.name.trim().toLowerCase(),
    store_url: removeAccents(columns.name.trim())
      .toLowerCase()
      .replaceAll(' ', '-'),
  }
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)

    redirect('/admin/sign-in')
  }

  const { error: storeError } = await supabase
    .from('stores')
    .insert({ user_id: session.user.id, ...newColumns })

  return { storeError }
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
