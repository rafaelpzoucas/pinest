'use server'

import { createClient } from '@/lib/supabase/server'
import { storeProcedure } from '@/lib/zsa-procedures'
import { AddressType } from '@/models/address'
import { OrderType } from '@/models/order'
import { cache } from 'react'

export async function readUserConnectedAccountId(userId: string) {
  const supabase = createClient()

  const { data: stripeAccount, error: stripeAccountError } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', userId)
    .single()

  return { stripeAccount, stripeAccountError }
}

export const readStoreAddress = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data: storeAddress, error: storeAddressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('store_id', store?.id)
      .single()

    if (storeAddressError) {
      console.error('Erro ao ler o endereço da loja.', storeAddressError)
    }

    return { storeAddress: storeAddress as AddressType }
  })

export const readStoreAddressCached = cache(readStoreAddress)

export async function readOrderItems(orderId: string): Promise<{
  order: OrderType | null
  orderError: any | null
}> {
  const supabase = createClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      `
        *,
        order_items (
          *,
          products (*)
        )
      `,
    )
    .eq('id', orderId)
    .single()

  return { order, orderError }
}
