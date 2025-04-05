import { storeProcedure } from '@/lib/zsa-procedures'
import { PurchaseType } from '@/models/purchase'

export const readPurchases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, cookieStore } = ctx

    const customerPhone = cookieStore.get(
      `${store.store_subdomain}_customer_phone`,
    )?.value

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerPhone)
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
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (error || !purchases) {
      console.error('Não foi possível ler os pedidos.', error)
    }

    return { purchases: purchases as PurchaseType[] }
  })
