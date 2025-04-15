import { createAdminClient } from '@/lib/supabase/admin'
import { IfoodOrder } from '@/models/ifood'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import { webhookProcedure } from './procedures'
import IfoodHandshakeDisputeSchema, {
  createIfoodPurchaseSchema,
} from './schemas'

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

export const createPurchase = webhookProcedure
  .createServerAction()
  .input(createIfoodPurchaseSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const ifoodOrderData: IfoodOrder = input.ifood_order_data

    const [store] = await readStore({
      merchantId: ifoodOrderData.merchant.id,
    })

    const { data: createdPurchase, error: createdPurchaseError } =
      await supabase
        .from('purchases')
        .insert({
          ...input,
          store_id: store.id,
          delivery_time: store.delivery_time,
        })
        .select()

    if (createdPurchaseError || !createdPurchase) {
      console.error('Não foi possível criar o pedido.', createdPurchaseError)
      return
    }

    return { createdPurchase }
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

    const newPurchaseValues: z.infer<typeof createIfoodPurchaseSchema> = {
      id,
      created_at: createdAt,
      status: 'accept',
      type: orderType,
      payment_type: payments?.methods?.[0]?.method ?? 'unknown',
      is_paid: false,
      is_ifood: true,
      total: {
        shipping_price: total.deliveryFee,
        change_value: payments?.methods?.[0]?.cash?.changeFor ?? 0,
        discount: total.benefits,
        subtotal: total.subTotal,
        total_amount: total.orderAmount,
      },
      delivery: {
        time: delivery.deliveryDateTime,
        address: delivery.deliveryAddress.formattedAddress,
      },
      ifood_order_data: orderData,
    }

    const validation = createIfoodPurchaseSchema.safeParse(newPurchaseValues)

    if (!validation.success) {
      console.error('Erro de validação:', validation.error)
      return
    }

    const [response] = await createPurchase(newPurchaseValues)

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
      .from('purchases')
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
      .from('purchases')
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
  console.info('Evento KEEPALIVE recebido. Webhook está ativo.')

  return NextResponse.json({ message: 'Webhook está ativo.' })
})

export const createHandshakeEvent = webhookProcedure
  .createServerAction()
  .input(IfoodHandshakeDisputeSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data, error } = await supabase
      .from('ifood_events')
      .upsert({ ...input })
      .select()

    if (error || !data) {
      console.error('Erro ao salvar evento de handshake:', error)
    }
    return NextResponse.json({
      message: 'Evento de handshake tratado com sucesso!',
    })
  })
