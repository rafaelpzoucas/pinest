'use server'

import { createClient } from '@/lib/supabase/server'
import { stringToNumber } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readStoreByUserId } from '../../../products/register/actions'
import { newExtraFormSchema } from './form'

export async function createExtra(values: z.infer<typeof newExtraFormSchema>) {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    throw new Error('Não foi possível recuperar o estabelecimento!', storeError)
  }

  const { data, error } = await supabase.from('extras').insert({
    ...values,
    name: values.name?.trim(),
    price: values.price && stringToNumber(values.price),
    store_id: store?.id,
  })

  if (error) {
    throw new Error('Não foi possível inserir um novo adicional!', error)
  }

  revalidatePath('/catalog')

  return { data, error }
}

export async function updateExtra(
  id: string,
  values: z.infer<typeof newExtraFormSchema>,
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('extras')
    .update({
      ...values,
      name: values.name?.trim(),
      price: values.price && stringToNumber(values.price),
    })
    .eq('id', id)
    .select()

  if (error) {
    throw new Error('Não foi possível atualizar o adicional!', error)
  }

  revalidatePath('/catalog')

  return { data, error }
}
