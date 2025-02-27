'use server'

import { createClient } from '@/lib/supabase/server'
import { UserType } from '@/models/user'
import { revalidatePath } from 'next/cache'

export async function readOwner(): Promise<{
  owner: UserType | null
  ownerError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: owner, error: ownerError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user?.id)
    .single()

  return { owner, ownerError }
}

export async function updateStoreStatus(isOpen: boolean) {
  const supabase = createClient()

  const { data: userData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('stores')
    .update({ is_open: isOpen })
    .eq('user_id', userData.user?.id)

  revalidatePath('/')

  return { data, error }
}
