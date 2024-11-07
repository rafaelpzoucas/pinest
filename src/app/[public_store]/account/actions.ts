'use server'

import { createClient } from '@/lib/supabase/server'
import { UserType } from '@/models/user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { accountSchema } from './form'

export async function selectCustomerUser(): Promise<{
  customerUser: UserType | null
  selectCustomerUserError: any | null
}> {
  const supabase = createClient()
  const { data: session } = await supabase.auth.getUser()
  let customerUser = null
  let selectCustomerUserError = null

  if (session?.user) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (selectCustomerUserError) {
      console.error(selectCustomerUserError)
    }

    customerUser = data
    selectCustomerUserError = error
  }

  return { customerUser, selectCustomerUserError }
}

export async function updateAccount(columns: z.infer<typeof accountSchema>) {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users')
    .update(columns)
    .eq('id', session.user?.id)

  revalidatePath('/')

  return { data, error }
}
