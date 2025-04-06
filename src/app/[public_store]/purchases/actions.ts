import { storeProcedure } from '@/lib/zsa-procedures'
import { PurchaseType } from '@/models/purchase'
import { StoreCustomerType } from '@/models/store-customer'
import { readCustomer } from '../account/actions'

export const readStoreCustomer = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const [customerData] = await readCustomer({})

    const customer = customerData?.customer

    const { data, error } = await supabase
      .from('store_customers')
      .select(
        `
          *,
          customers (*)
        `,
      )
      .eq('customer_id', customer?.id)
      .eq('store_id', store.id)
      .single()

    if (error) {
      console.error('Não foi possível buscar o cliente da loja', error)
    }

    return { storeCustomer: data as StoreCustomerType }
  })

export const readPurchases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const [storeCustomerData] = await readStoreCustomer()
    const storeCustomer = storeCustomerData?.storeCustomer

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
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (error || !purchases) {
      console.error('Não foi possível ler os pedidos.', error)
    }

    return { purchases: purchases as PurchaseType[] }
  })
