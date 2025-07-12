import { storeProcedure } from '@/lib/zsa-procedures'
import { PurchaseType } from '@/models/purchase'
import { StoreCustomerType } from '@/models/store-customer'
import { cache } from 'react'
import { readCustomer } from '../account/actions'
import { generateRequestId, logCpu } from '../utils'

export const readStoreCustomer = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readStoreCustomer`, async () => {
      const { store, supabase } = ctx

      const [customerData] = await logCpu(
        `${requestId}::getCustomerData`,
        async () => {
          return await readCustomer({})
        },
      )

      const customer = customerData?.customer

      const { data, error } = await logCpu(
        `${requestId}::fetchStoreCustomerDB`,
        async () => {
          return await supabase
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
        },
      )

      if (error) {
        throw new Error(
          'Não foi possível buscar o cliente da loja',
          error as Error,
        )
      }

      return { storeCustomer: data as StoreCustomerType }
    })
  })

export const readPurchases = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readPurchases`, async () => {
      const { supabase, store } = ctx

      const [storeCustomerData] = await logCpu(
        `${requestId}::getStoreCustomer`,
        async () => {
          return await readStoreCustomer()
        },
      )
      const storeCustomer = storeCustomerData?.storeCustomer

      const { data: purchases, error } = await logCpu(
        `${requestId}::fetchPurchasesDB`,
        async () => {
          return await supabase
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
        },
      )

      if (error || !purchases) {
        console.error('Não foi possível ler os pedidos.', error)
      }

      return { purchases: purchases as PurchaseType[] }
    })
  })

export const readStoreCustomerCached = cache(readStoreCustomer)
export const readPurchasesCached = cache(readPurchases)
