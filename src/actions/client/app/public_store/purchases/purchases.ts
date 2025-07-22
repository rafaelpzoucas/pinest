import { createClient } from '@/lib/supabase/client'
import { PurchaseType } from '@/models/purchase'
import { z } from 'zod'
import { readCustomer } from '../cart/customer'

const ReadPurchasesSchema = z.object({
  storeId: z.string().optional(),
  subdomain: z.string().optional(),
})

type ReadPurchases = z.infer<typeof ReadPurchasesSchema>

export async function readPurchasesData(input: ReadPurchases) {
  const supabase = createClient()

  const customerData = await readCustomer({ subdomain: input.subdomain })
  const storeCustomer = customerData?.customer

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(
      `
        *,
        purchase_items (
          *,
          products (
            *
          )
        )
      `,
    )
    .eq('customer_id', storeCustomer?.id)
    .eq('store_id', input.storeId)
    .order('created_at', { ascending: false })

  if (error || !purchases) {
    console.error('Não foi possível ler os pedidos.', error)
  }

  return { purchases: purchases as PurchaseType[] }
}
