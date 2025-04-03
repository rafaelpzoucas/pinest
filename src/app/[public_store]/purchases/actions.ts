import { storeProcedure } from '@/lib/zsa-procedures'
import { PurchaseType } from '@/models/purchase'

export const readPurchases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase } = ctx
    const { data: session } = await supabase.auth.getUser()

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', session.user?.id)
      .single()

    if (customerError) {
      console.error('Erro ao ler o cliente', customerError)
    }

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

    if (error || !purchases) {
      console.error('Não foi possível ler os pedidos.', error)
    }

    return { purchases: purchases as PurchaseType[] }
  })
