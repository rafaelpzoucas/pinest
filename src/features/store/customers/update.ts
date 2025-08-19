'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction, ZSAError } from 'zsa'
import { readCustomer } from './read'
import { UpdateCustomerSchema } from './schemas'

export const updateStoreCustomer = createServerAction()
  .input(UpdateCustomerSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: updatedCustomer, error: updateCustomerError } = await supabase
      .from('customers')
      .update(input)
      .eq('id', input.id)
      .select()
      .single()

    if (updateCustomerError) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', updateCustomerError.message)
    }

    const [[storeCustomerData], { data: store, error: readStoreError }] =
      await Promise.all([
        readCustomer({}),
        supabase
          .from('stores')
          .select('id')
          .eq('store_subdomain', input.subdomain)
          .single(),
      ])

    if (readStoreError) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', readStoreError.message)
    }

    const storeCustomer = storeCustomerData?.customer

    if (!storeCustomer) {
      const { data: createdStoreCustomer, error: createStoreCustomerError } =
        await supabase
          .from('store_customers')
          .insert({ customer_id: updatedCustomer?.id, store_id: store?.id })
          .select()
          .single()

      if (createStoreCustomerError || !createdStoreCustomer) {
        console.error(
          'Não foi possível adicionar o cliente à loja',
          createStoreCustomerError,
        )
      }
    }
  })
