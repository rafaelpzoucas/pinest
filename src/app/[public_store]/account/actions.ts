'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { CustomerType } from '@/models/customer'
import { z } from 'zod'

export const readCustomer = storeProcedure
  .createServerAction()
  .input(z.object({ phone: z.string().optional() }))
  .handler(async ({ ctx, input }) => {
    const { store, supabase, cookieStore } = ctx

    if (input.phone) {
      cookieStore.set(`${store.store_subdomain}_customer_phone`, input.phone)
      return
    }

    const customerPhone = cookieStore.get(
      `${store.store_subdomain}_customer_phone`,
    )?.value

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customerPhone || input.phone)
      .single()

    if (error || !customer) {
      console.error('Erro ao buscar o cliente pelo telefone', error)
    }

    return { customer: customer as CustomerType }
  })
