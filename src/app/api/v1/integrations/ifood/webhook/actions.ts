import { nofityStore } from '@/app/[public_store]/checkout/@summary/actions'
import { createAdminClient } from '@/lib/supabase/admin'
import { IfoodOrder } from '@/models/ifood'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { webhookProcedure } from './procedures'
import IfoodHandshakeDisputeSchema, { createIfoodOrderSchema } from './schemas'

export const readIntegration = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: integration, error } = await supabase
      .from('ifood_integrations')
      .select('*')
      .eq('merchant_id', input.merchantId)
      .single()

    if (error || !integration) {
      console.error('Não foi possível encontrar a loja.', error)
      return
    }

    return integration
  })

export const readStore = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { merchantId } = input

    const [integration] = await readIntegration({
      merchantId,
    })

    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', integration.store_id)
      .single()

    if (error || !store) {
      console.error('Não foi possível encontrar a loja.', error)
      return
    }

    return store
  })

export const createOrder = webhookProcedure
  .createServerAction()
  .input(createIfoodOrderSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const ifoodOrderData: IfoodOrder = input.ifood_order_data

    const [store] = await readStore({
      merchantId: ifoodOrderData.merchant.id,
    })

    const { data: createdOrder, error: createdOrderError } = await supabase
      .from('orders')
      .insert({
        ...input,
        store_id: store.id,
        delivery_time: store.delivery_time,
      })
      .select()

    if (createdOrderError || !createdOrder) {
      console.error('Não foi possível criar o pedido.', createdOrderError)
      return
    }

    nofityStore({
      storeId: store?.id,
      title: 'Novo pedido',
      icon: '/ifood-icon.png',
    })

    return { createdOrder }
  })

export const refreshAccessToken = createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createAdminClient()
    const { merchantId } = input

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

      // 🔹 4. Atualizar token no banco
      const { error } = await supabase
        .from('ifood_integrations')
        .update({
          access_token: data.accessToken,
          expires_at: expiresAt.toISOString(),
        })
        .eq('merchant_id', merchantId)

      if (error) {
        console.error('❌ Erro ao atualizar token no banco:', error)
        return
      }

      return data.accessToken
    }
  })

export const getAccessToken = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { merchantId } = input
    const { supabase } = ctx

    const { data, error } = await supabase
      .from('ifood_integrations')
      .select('access_token, expires_at')
      .eq('merchant_id', merchantId)
      .single()

    if (error || !data?.access_token) {
      console.error('🔄 Token não encontrado, gerando um novo...')
      return await refreshAccessToken({ merchantId })
    }

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now >= expiresAt) {
      console.error(
        '🔄 Token expirado, tentando gerar um novo para',
        merchantId,
      )
      const [newToken] = await refreshAccessToken({ merchantId })
      console.error('Novo token gerado:', newToken)
      return newToken
    }

    return data.access_token
  })

export const getIfoodOrderData = webhookProcedure
  .createServerAction()
  .input(
    z.object({
      merchantId: z.string(),
      orderId: z.string({ message: 'orderId is required' }),
    }),
  )
  .handler(async ({ input }) => {
    const { orderId, merchantId } = input
    const api = process.env.IFOOD_API_BASE_URL

    const [accessToken] = await getAccessToken({ merchantId })

    if (!accessToken) {
      console.error('😨 Erro ao buscar access_token no banco.', accessToken)
      return
    }

    const response = await fetch(`${api}/order/v1.0/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!data) {
      console.error('Pedido não encontrado.', data)
      return
    }

    return data as IfoodOrder
  })

export const handleOrderPlaced = webhookProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), merchantId: z.string() }))
  .handler(async ({ input }) => {
    const { orderId, merchantId } = input

    const [orderData] = await getIfoodOrderData({ orderId, merchantId })

    if (!orderData) {
      return
    }

    const { id, createdAt, orderType, payments, total, delivery } = orderData

    const newOrderValues = {
      id,
      created_at: createdAt,
      status: 'accept',
      type: orderType,
      payment_type: payments?.methods?.[0]?.method ?? 'unknown',
      is_paid: payments?.pending === 0,
      is_ifood: true,
      total: {
        shipping_price: total.deliveryFee,
        change_value: payments?.methods?.[0]?.cash?.changeFor ?? 0,
        discount: total.benefits,
        subtotal: total.subTotal,
        total_amount: total.orderAmount,
      },
      delivery:
        orderType === 'DELIVERY'
          ? {
              time: delivery?.deliveryDateTime ?? undefined,
              address: delivery?.deliveryAddress?.formattedAddress ?? '',
            }
          : {
              time: undefined,
              address: '',
            },
      ifood_order_data: orderData,
    }

    const validation = createIfoodOrderSchema.safeParse(newOrderValues)

    if (!validation.success) {
      console.error('Erro de validação:', validation.error)
      return
    }

    const [response] = await createOrder(newOrderValues)

    if (!response) {
      console.error('Erro ao criar pedido', response)
    }

    return NextResponse.json({ message: 'Pedido criado com sucesso.' })
  })

export const handleOrderNewStatus = webhookProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), newStatus: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { orderId, newStatus } = input
    const { supabase } = ctx

    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()

    if (error || !data) {
      console.error('Erro ao confirmar pedido:', error)
      return
    }

    return NextResponse.json({ message: 'Pedido confirmado com sucesso.' })
  })

export const handleCancelOrder = webhookProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { orderId } = input
    const { supabase } = ctx

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()

    if (error || !data) {
      console.error('Erro ao cancelar pedido:', error)
      return
    }

    return NextResponse.json({ message: 'Pedido cancelado com sucesso.' })
  })

export const keepAlive = createServerAction().handler(async () => {
  return NextResponse.json({
    message: 'Evento KEEPALIVE recebido.',
  })
})

export const createHandshakeEvent = webhookProcedure
  .createServerAction()
  .input(IfoodHandshakeDisputeSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const [store] = await readStore({ merchantId: input.merchantId })

    const { error } = await supabase.from('ifood_events').upsert(input).select()

    if (error) {
      console.error('Erro ao salvar evento de handshake:', error)
    }

    revalidatePath('/')

    nofityStore({
      storeId: store?.id,
      title: 'Novo pedido',
      icon: '/ifood-icon.png',
    })

    return NextResponse.json({
      message: 'Evento de handshake tratado com sucesso!',
    })
  })

export const deleteHandshakeEvent = webhookProcedure
  .createServerAction()
  .input(z.object({ order_id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('ifood_events')
      .delete()
      .eq('orderId', input.order_id)

    if (error) {
      console.error('Erro ao salvar evento de handshake:', error)
    }

    revalidatePath('/')

    return NextResponse.json({
      message: 'Evento de handshake tratado com sucesso!',
    })
  })
