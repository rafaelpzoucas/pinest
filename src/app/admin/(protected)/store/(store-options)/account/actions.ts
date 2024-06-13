'use server'

import { createClient } from '@/lib/supabase/server'
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
      ),
      addresses (
        *
      )
    `,
    )
    .eq('id', session.user?.id)
    .single()
  return { data, error }
}
