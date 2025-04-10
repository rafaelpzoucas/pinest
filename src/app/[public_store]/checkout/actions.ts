'use server'

import { createClient } from '@/lib/supabase/server'
import { storeProcedure } from '@/lib/zsa-procedures'
import { AddressType } from '@/models/address'
import { PurchaseType } from '@/models/purchase'

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

export async function readPurchaseItems(purchaseId: string): Promise<{
  purchase: PurchaseType | null
  purchaseError: any | null
}> {
  const supabase = createClient()

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select(
      `
        *,
        purchase_items (
          *,
          products (*)
        )
      `,
    )
    .eq('id', purchaseId)
    .single()

  return { purchase, purchaseError }
}
