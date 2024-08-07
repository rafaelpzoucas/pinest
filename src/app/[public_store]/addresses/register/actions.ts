'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { addressFormSchema } from './form'

export async function createCustomerAddress(
  values: z.infer<typeof addressFormSchema>,
) {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !session?.user) {
    console.error(sessionError)
  }

  const { error } = await supabase
    .from('addresses')
    .insert([
      {
        user_id: session?.user?.id,
        zip_code: values.zip_code,
        street: values.street,
        number: values.number,
        neighborhood: values.neighborhood,
        state: values.state,
        city: values.city,
        complement: values.complement,
      },
    ])
    .select()

  if (error) {
    console.error(error)
  }

  return { error }
}
