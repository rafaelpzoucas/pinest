'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addressSchema } from './form'

export async function updateAddress(columns: z.infer<typeof addressSchema>) {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('addresses')
    .update(columns)
    .eq('user_id', session.user?.id)

  revalidatePath('account')

  return { data, error }
}
