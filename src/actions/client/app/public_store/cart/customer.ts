import { createClient } from '@/lib/supabase/client'
import { CustomerType } from '@/models/customer'
import { parseCookies, setCookie } from 'nookies'
import { z } from 'zod'

const ReadCustomerSchema = z.object({
  subdomain: z.string(),
  phone: z.string().optional(),
})

type ReadCustomer = z.infer<typeof ReadCustomerSchema>

export async function readCustomer(input: ReadCustomer) {
  const { subdomain, phone } = input

  if (!subdomain) {
    throw new Error('Subdomain is required.')
  }

  const supabase = createClient()

  // Define chave do cookie
  const phoneCookieKey = `${subdomain}_customer_phone`
  const cookieStore = parseCookies()
  const cookiePhone = cookieStore[phoneCookieKey]

  // Define qual telefone será usado
  const customerPhone = phone ?? cookiePhone
  if (!customerPhone) {
    throw new Error('Telefone do cliente não informado.')
  }

  // Atualiza o cookie, se novo telefone foi informado
  if (phone && phone !== cookiePhone) {
    setCookie(null, phoneCookieKey, phone, {
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
  }

  // Consulta
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', customerPhone)
    .single()

  if (error || !customer) {
    throw new Error(`Erro ao buscar o cliente pelo telefone: ${customerPhone}`)
  }

  return { customer: customer as CustomerType }
}
