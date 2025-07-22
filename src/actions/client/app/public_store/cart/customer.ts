import { createClient } from '@/lib/supabase/client'
import { CustomerType } from '@/models/customer'
import { parseCookies, setCookie } from 'nookies'
import { z } from 'zod'

const ReadCustomerSchema = z.object({
  phone: z.string().optional(),
  subdomain: z.string().optional(),
})

type ReadCustomer = z.infer<typeof ReadCustomerSchema>

export async function readCustomer(input: ReadCustomer) {
  const supabase = createClient()

  const cookieStore = parseCookies()

  if (input.phone) {
    setCookie(null, `${input.subdomain}_customer_phone`, input.phone)
    return
  }

  const phoneCookie = `${input.subdomain}_customer_phone`
  const customerPhone = cookieStore[phoneCookie]

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', customerPhone || input.phone)
    .single()

  if (error || !customer) {
    throw new Error('Erro ao buscar o cliente pelo telefone', error as Error)
  }

  return { customer: customer as CustomerType }
}
