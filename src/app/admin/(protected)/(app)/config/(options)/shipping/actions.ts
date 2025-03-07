'use server'

import { createClient } from '@/lib/supabase/server'
import { stringToNumber } from '@/lib/utils'
import { ShippingConfigType } from '@/models/shipping'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readStoreByUserId } from '../account/actions'
import { ownShippingFormSchema } from './own-shipping/form'

export async function readOwnShipping(): Promise<{
  shipping: ShippingConfigType | null
  shippingError: any | null
}> {
  const supabase = createClient()

  const { store } = await readStoreByUserId()

  const { data: shipping, error: shippingError } = await supabase
    .from('shippings')
    .select('*')
    .eq('store_id', store?.id)
    .single()

  if (shippingError) {
    console.error(shippingError)
  }

  return {
    shipping,
    shippingError,
  }
}

export async function createOwnShipping(
  values: z.infer<typeof ownShippingFormSchema>,
) {
  const supabase = createClient()
  const { store } = await readStoreByUserId()

  const { data: createdOwnShipping, error: createOwnShippingError } =
    await supabase
      .from('shippings')
      .insert({
        ...values,
        delivery_time: parseInt(values.delivery_time),
        price: values.price ? stringToNumber(values.price) : 0,
        store_id: store?.id,
      })
      .select()

  if (createOwnShippingError) {
    console.error(createOwnShippingError)
  }

  revalidatePath('/admin/config/shipping')

  return { createdOwnShipping, createOwnShippingError }
}

export async function updateOwnShipping(
  values: z.infer<typeof ownShippingFormSchema>,
) {
  const supabase = createClient()
  const { store } = await readStoreByUserId()

  const { data: updatedOwnShipping, error: updateOwnShippingError } =
    await supabase
      .from('shippings')
      .update({
        ...values,
        delivery_time: parseInt(values.delivery_time),
        price: values.price ? stringToNumber(values.price) : 0,
      })
      .eq('store_id', store?.id)
      .select()

  if (updateOwnShippingError) {
    console.error(updateOwnShippingError)
  }

  revalidatePath('/admin/config/shipping')

  return { updatedOwnShipping, updateOwnShippingError }
}

export async function updateOwnShippingStatus(status: boolean) {
  const supabase = createClient()
  const { store } = await readStoreByUserId()

  const { data: updatedStatus, error: updateStatusError } = await supabase
    .from('shippings')
    .update({
      status,
    })
    .eq('store_id', store?.id)
    .select()

  if (updateStatusError) {
    console.error(updateStatusError)
  }

  revalidatePath('/admin/config/shipping')

  return { updatedStatus, updateStatusError }
}
