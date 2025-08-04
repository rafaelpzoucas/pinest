'use server'

import {
  createCustomerSchema,
  updateCustomerSchema,
} from '@/app/[public_store]/account/register/schemas'
import { adminProcedure } from '@/lib/zsa-procedures'
import { StoreCustomerType } from '@/models/store-customer'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'

export const createCustomer = adminProcedure
  .createServerAction()
  .input(createCustomerSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    const { data: createdCustomer, error: createCustomerError } = await supabase
      .from('customers')
      .insert(input)
      .select()
      .single()

    if (createCustomerError || !createdCustomer) {
      console.error('Não foi possível criar o cliente.', createCustomerError)
    }

    const { data: createdStoreCustomer, error: createStoreCustomerError } =
      await supabase
        .from('store_customers')
        .insert({ customer_id: createdCustomer?.id, store_id: store.id })
        .select()
        .single()

    if (createStoreCustomerError || !createdStoreCustomer) {
      console.error(
        'Não foi possível adicionar o cliente à loja',
        createStoreCustomerError,
      )
    }

    const createdStoreCustomerData: StoreCustomerType = {
      ...createdStoreCustomer,
      customers: createCustomer,
    }

    return { createdStoreCustomer: createdStoreCustomerData }
  })

export const updateCustomer = adminProcedure
  .createServerAction()
  .input(updateCustomerSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { id, ...dataToUpdate } = input

    const { error: updateCustomerError } = await supabase
      .from('customers')
      .update(dataToUpdate)
      .eq('id', id)

    if (updateCustomerError) {
      throw new Error(
        `Não foi possível atualizar os dados do cliente: ${updateCustomerError.message}`,
      )
    }
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

export const readCustomerLastPurchasesCached = cache(readCustomerLastPurchases)
