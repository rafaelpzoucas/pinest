import { createClient } from '@/lib/supabase/client'
import { CustomerType } from '@/models/customer'
import { ShippingConfigType } from '@/models/shipping'
import { StoreType } from '@/models/store'
import { parseCookies, setCookie } from 'nookies'

interface Input {
  phone?: string
}

export async function readCustomerByPhone(
  store: StoreType | null,
  input?: Input,
): Promise<{ customer: CustomerType } | undefined> {
  'use client'

  const supabase = createClient()

  // Se phone foi fornecido, salva no cookie e retorna
  if (input?.phone) {
    setCookie(null, `${store?.store_subdomain}_customer_phone`, input.phone, {
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return
  }

  // Busca o telefone salvo no cookie
  const customerPhone =
    parseCookies()[`${store?.store_subdomain}_customer_phone`]

  if (!customerPhone) {
    throw new Error('Telefone do cliente não encontrado')
  }

  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', customerPhone)
      .single()

    if (error || !customer) {
      throw new Error(
        'Erro ao buscar o cliente pelo telefone: ' + error?.message,
      )
    }

    return { customer: customer as CustomerType }
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    throw error
  }
}

// Função auxiliar para limpar o cookie
export function clearCustomerPhone(store: StoreType) {
  setCookie(null, `${store.store_subdomain}_customer_phone`, '', {
    maxAge: -1,
    path: '/',
  })
}

// Função auxiliar para verificar se existe telefone salvo
export function hasCustomerPhone(store: StoreType): boolean {
  const customerPhone =
    parseCookies()[`${store.store_subdomain}_customer_phone`]
  return !!customerPhone
}

export async function readDeliveryData(store: StoreType | null) {
  'use client'

  const supabase = createClient()

  const { data: delivery, error: deliveryError } = await supabase
    .from('shippings')
    .select('*')
    .eq('store_id', store?.id)
    .single()

  if (deliveryError) {
    console.error('Erro ao ler os dados de entrega da loja.', deliveryError)
  }

  return {
    delivery: delivery as ShippingConfigType,
  }
}
