'use server'

import { createClient } from '@/lib/supabase/server'
import { StoreCustomerType } from '@/models/store-customer'
import { createServerAction, ZSAError } from 'zsa'
import { readAdminCustomersSchema } from './schemas'

export const readAdminCustomersServer = createServerAction()
  .input(readAdminCustomersSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data: customers, error: customersError } = await supabase
      .from('store_customers')
      .select(
        `
          *,
          customers (*)
        `,
      )
      .eq('store_id', input.storeId)

    if (customersError) {
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        customersError.message ?? 'Error fetching customers.',
      )
    }

    return { customers: customers as StoreCustomerType[] }
  })
