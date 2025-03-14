'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { createCustomerFormSchema } from './schemas'

export const readCustomers = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', store.id)

    if (customersError || !customers) {
      throw new Error('Error fetching customers', customersError)
    }

    return { customers }
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
