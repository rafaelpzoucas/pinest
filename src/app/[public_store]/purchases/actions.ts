import { storeProcedure } from '@/lib/zsa-procedures'
import { PurchaseType } from '@/models/purchase'
import { StoreCustomerType } from '@/models/store-customer'
import { cache } from 'react'
import { readCustomer } from '../account/actions'

export const readStoreCustomer = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readStoreCustomer')
    const { store, supabase } = ctx

    console.time('getCustomerData')
    const [customerData] = await readCustomer({})
    console.timeEnd('getCustomerData')

    const customer = customerData?.customer

    console.time('fetchStoreCustomerDB')
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
    console.timeEnd('fetchStoreCustomerDB')

    if (error) {
      throw new Error(
        'Não foi possível buscar o cliente da loja',
        error as Error,
      )
    }

    console.timeEnd('readStoreCustomer')
    return { storeCustomer: data as StoreCustomerType }
  })

export const readPurchases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readPurchases')
    const { supabase, store } = ctx

    console.time('getStoreCustomer')
    const [storeCustomerData] = await readStoreCustomer()
    console.timeEnd('getStoreCustomer')
    const storeCustomer = storeCustomerData?.storeCustomer

    console.time('fetchPurchasesDB')
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
    console.timeEnd('fetchPurchasesDB')

    if (error || !purchases) {
      console.error('Não foi possível ler os pedidos.', error)
    }

    console.timeEnd('readPurchases')
    return { purchases: purchases as PurchaseType[] }
  })

export const readStoreCustomerCached = cache(readStoreCustomer)
export const readPurchasesCached = cache(readPurchases)
