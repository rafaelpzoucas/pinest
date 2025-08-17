'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createServerAction, ZSAError } from 'zsa'
import { Customer, ReadCustomerSchema } from './schemas'

export const readStoreCustomer = createServerAction()
  .input(ReadCustomerSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()

    const phoneCookieKey = `${input.subdomain}_customer_phone`
    const cookieStore = cookies()
    const cookiePhone = cookieStore.get(phoneCookieKey)?.value

    const customerPhone = input.phone ?? cookiePhone

    if (!customerPhone) {
      throw new Error('Telefone do cliente não informado.')
    }

    // Atualiza o cookie, se novo telefone foi informado
    if (input.phone && input.phone !== cookiePhone) {
      cookieStore.set(phoneCookieKey, input.phone, {
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customerPhone)
      .single()

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }

    return {
      customer: customer as Customer,
    }
  })
