'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type UserAddress = {
  id: string
  city: string
  state: string
  number: string
  street: string
  user_id: string
  zip_code: string
  complement: string
  created_at: string
  neighborhood: string
}

type UserType = {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
  role: string
  phone: string
  user_addresses: UserAddress[]
}

type FetchUserReturnType = {
  users: UserType[] | null
  error: any | null
}

export async function getAuthenticatedUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  return { data, error }
}

export async function fetchUser(): Promise<FetchUserReturnType> {
  const supabase = createClient()
  const { data: userData, error: userError } = await getAuthenticatedUser()

  if (userError) {
    return redirect('/admin/sign-in')
  }

  const { data: users, error } = await supabase
    .from('users')
    .select(
      `
        *,
        user_addresses (
          *
        )
      `,
    )
    .eq('id', userData.user?.id)

  return { users, error }
}
