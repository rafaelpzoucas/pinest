import { createClient } from '@/lib/supabase/server'
import { PurchaseType } from '@/models/purchase'

export async function readPurchases(): Promise<{
  purchases: PurchaseType[] | null
  error: any | null
}> {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getUser()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', session.user?.id)
    .single()

  console.error(customerError)

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
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return { purchases, error }
}
