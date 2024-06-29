import { createClient } from '@/lib/supabase/server'
import { UserType } from '@/models/user'

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
