'use server'

import { createClient } from '@/lib/supabase/server'
import { UserType } from '@/models/user'
import { z } from 'zod'
import { profileSchema } from './form'

export async function readUserById(userId: string): Promise<{
  user: UserType | null
  userError: any | null
}> {
  const supabase = createClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { user, userError }
}

export async function updateProfile(columns: z.infer<typeof profileSchema>) {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users')
    .update(columns)
    .eq('id', session.user?.id)

  return { data, error }
}
