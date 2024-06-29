import { createClient } from '@/lib/supabase/server'
import { StoreType } from '@/models/store'
import { UserType } from '@/models/user'
import { redirect } from 'next/navigation'

export async function readOwner(): Promise<{
  user: UserType | null
  userError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)

    redirect('/admin/sign-in')
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user?.id)
    .single()

  return { user, userError }
}

export async function readStore(): Promise<{
  store: StoreType | null
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
