'use server'

import { createClient } from '@/lib/supabase/server'
import { CarrierType } from '@/models/carrier'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readStoreByUserId } from '../../account/actions'
import { carrierFormSchema } from './form'

export async function selectCarriers(): Promise<{
  carriers: CarrierType[] | null
  carriersError: any | null
}> {
  const supabase = createClient()

  const { data: carriers, error: carriersError } = await supabase
    .from('carriers')
    .select('*')

  return { carriers, carriersError }
}

export async function updateShippingCarrier(
  values: z.infer<typeof carrierFormSchema>,
) {
  const supabase = createClient()
  const { store } = await readStoreByUserId()

  const { data: updatedOwnShipping, error: updateOwnShippingError } =
    await supabase
      .from('shippings')
      .update(values)
      .eq('store_id', store?.id)
      .select()

  if (updateOwnShippingError) {
    console.error(updateOwnShippingError)
  }

  revalidatePath('/admin/config/shipping')

  return { updatedOwnShipping, updateOwnShippingError }
}
