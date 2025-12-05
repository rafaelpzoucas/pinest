'use server'

import { buildReceiptKitchenESCPOS } from '@/lib/receipts'
import { createClient } from '@/lib/supabase/server'
import { CancellationReasonsType } from '@/models/ifood'
import { OrderType } from '@/models/order'

export const refreshIfoodAccessToken = async (storeId: string) => {
  const supabase = createClient()

  const clientId = process.env.IFOOD_CLIENT_ID
  const clientSecret = process.env.IFOOD_CLIENT_SECRET
  const api = process.env.IFOOD_API_BASE_URL

  const body = new URLSearchParams()
  body.append('grantType', 'client_credentials')
  body.append('clientId', clientId ?? '')
  body.append('clientSecret', clientSecret ?? '')

  const response = await fetch(`${api}/authentication/v1.0/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = await response.json()

  if (data.accessToken) {
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expiresIn)

    const { error } = await supabase
      .from('ifood_integrations')
      .update({
        access_token: data.accessToken,
        expires_at: expiresAt.toISOString(),
      })
      .eq('store_id', storeId)

    if (error) {
      console.error('❌ Erro ao atualizar token no banco:', error)
      return { success: false, message: 'Erro ao salvar token' }
    }

    return { success: true, accessToken: data.accessToken }
  }

  return { success: false, message: 'Erro ao obter token do iFood' }
}

export async function getCancellationReasons(orderId: string): Promise<{
  data: CancellationReasonsType[]
} | null> {
  try {
    const supabase = createClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Não foi possível buscar as informações do pedido')
      return null
    }

    if (!order.is_ifood) {
      return null
    }

    const { data: ifood, error: ifoodError } = await supabase
      .from('ifood_integrations')
      .select('*')
      .eq('store_id', order?.store_id)
      .single()

    if (ifoodError || !ifood) {
      console.error('Nenhuma integração com ifood encontrada.')
      return null
    }

    const now = new Date()
    const expiresAt = new Date(ifood.expires_at)

    if (now >= expiresAt) {
      await refreshIfoodAccessToken(order.store_id)
    }

    const api = process.env.IFOOD_API_BASE_URL

    const response = await fetch(
      `${api}/order/v1.0/orders/${orderId}/cancellationReasons`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ifood?.access_token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const data = await response.json()

    return { data: data ?? null }
  } catch (error) {
    console.error('Erro ao buscar motivos de cancelamento:', error)
    return null
  }
}

export async function requestCancellation(
  values: { reason: string; cancellationCode: string },
  orderId: string,
) {
  const api = process.env.IFOOD_API_BASE_URL

  try {
    const supabase = createClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Não foi possível buscar as informações do pedido')
      return null
    }

    if (!order.is_ifood) {
      return null
    }

    const { data: ifood, error: ifoodError } = await supabase
      .from('ifood_integrations')
      .select('*')
      .eq('store_id', order?.store_id)
      .single()

    if (ifoodError || !ifood) {
      console.error('Nenhuma integração com ifood encontrada.')
      return null
    }

    const now = new Date()
    const expiresAt = new Date(ifood.expires_at)

    if (now >= expiresAt) {
      await refreshIfoodAccessToken(order.store_id)
    }

    const body = JSON.stringify(values)

    const response = await fetch(
      `${api}/order/v1.0/orders/${orderId}/requestCancellation`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ifood.access_token}`,
          'Content-Type': 'application/json',
        },
        body,
      },
    )

    const responseData = await response.json()

    if (!response.ok) {
      console.error('Erro ao solicitar cancelamento do pedido', responseData)
      return
    }

    return { success: true, message: responseData.message }
  } catch (error) {
    console.error('Erro ao solicitar cancelamento do pedido', error)
    return {
      success: false,
      message: 'Erro ao solicitar cancelamento do pedido',
    }
  }
}

export async function sendToPrint(order: OrderType, reprint = false) {
  const textToPrint = buildReceiptKitchenESCPOS(order, reprint)

  await fetch('http://127.0.0.1:53281/print', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: textToPrint,
  })
}
