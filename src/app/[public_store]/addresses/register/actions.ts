'use server'

import { createClient } from '@/lib/supabase/server'
import { AddressType } from '@/models/address'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addressFormSchema } from './form'

export async function createCustomerAddress(
  values: z.infer<typeof addressFormSchema>,
): Promise<{
  createdAddress: AddressType | null
  createAddressError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !session?.user) {
    console.error(sessionError)
  }

  const { data: createdAddress, error: createAddressError } = await supabase
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
    .single()

  if (createAddressError) {
    console.error(createAddressError)
  }

  revalidatePath('/checkout')

  return { createdAddress, createAddressError }
}

export async function updateCustomerAddress(
  values: z.infer<typeof addressFormSchema>,
  addressId: string,
) {
  const supabase = createClient()

  const { data: updatedAddress, error: updateAddressError } = await supabase
    .from('addresses')
    .update(values)
    .eq('id', addressId)

  if (updateAddressError) {
    console.error(updateAddressError)
  }

  revalidatePath('/checkout')

  return { updatedAddress, updateAddressError }
}
