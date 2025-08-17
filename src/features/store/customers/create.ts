'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction, ZSAError } from 'zsa'
import { CreateCustomerSchema, Customer } from './schemas'

export const createStoreCustomer = createServerAction()
  .input(CreateCustomerSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const [
      { data: createdCustomer, error: createCustomerError },
      { data: store, error: readStoreError },
    ] = await Promise.all([
      supabase.from('customers').insert(input).select().single(),

      supabase
        .from('stores')
        .select('id')
        .eq('store_subdomain', input.subdomain)
        .single(),
    ])

    if (createCustomerError || readStoreError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        createCustomerError?.message || readStoreError?.message,
      )
    }

    const { data: createdStoreCustomer, error: createStoreCustomerError } =
      await supabase
        .from('store_customers')
        .insert({ customer_id: createdCustomer?.id, store_id: store?.id })
        .select()
        .single()

    if (createStoreCustomerError || !createdStoreCustomer) {
      console.error(
        'Não foi possível adicionar o cliente à loja',
        createStoreCustomerError,
      )
    }

    return { createdCustomer: createdCustomer as Customer }
  })
