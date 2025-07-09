'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { StoreCustomerType } from '@/models/store-customer'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import { createCustomerFormSchema } from './schemas'

export const readCustomers = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: customers, error: customersError } = await supabase
      .from('store_customers')
      .select(
        `
          *,
          customers (*)
        `,
      )
      .eq('store_id', store.id)

    if (customersError || !customers) {
      throw new Error('Error fetching customers', customersError)
    }

    return { customers: customers as StoreCustomerType[] }
  })

export const createCustomer = adminProcedure
  .createServerAction()
  .input(createCustomerFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data: createdCustomer, error: createError } = await supabase
      .from('customers')
      .insert({
        ...input,
        store_id: store.id,
      })
      .select()

    if (createError || !createdCustomer) {
      throw new Error('Error creating customer', createError)
    }

    revalidatePath('/admin/purchases')

    return { createdCustomer }
  })

export const readCustomerLastPurchases = adminProcedure
  .createServerAction()
  .input(z.object({ customerId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data: lastPurchases, error: readLastPurchasesError } =
      await supabase
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
        .eq('store_id', store.id)
        .eq('customer_id', input.customerId)
        .order('created_at', { ascending: false })

    if (readLastPurchasesError || !lastPurchases) {
      throw new Error('Error creating customer', readLastPurchasesError)
    }

    revalidatePath('/admin/purchases')

    return { lastPurchases }
  })

export const readCustomersCached = cache(readCustomers)
export const readCustomerLastPurchasesCached = cache(readCustomerLastPurchases)
