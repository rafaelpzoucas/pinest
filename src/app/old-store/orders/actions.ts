import { storeProcedure } from '@/lib/zsa-procedures'
import { OrderType } from '@/models/order'
import { StoreCustomerType } from '@/models/store-customer'
import { cache } from 'react'
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
      throw new Error(
        'Não foi possível buscar o cliente da loja',
        error as Error,
      )
    }

    return { storeCustomer: data as StoreCustomerType }
  })

export const readOrders = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const [storeCustomerData] = await readStoreCustomer()
    const storeCustomer = storeCustomerData?.storeCustomer

    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
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

    if (error || !orders) {
      console.error('Não foi possível ler os pedidos.', error)
    }

    return { orders: orders as OrderType[] }
  })

export const readStoreCustomerCached = cache(readStoreCustomer)
export const readOrdersCached = cache(readOrders)
