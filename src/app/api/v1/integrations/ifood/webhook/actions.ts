import { createAdminClient } from '@/lib/supabase/admin'
import { IfoodOrder } from '@/models/ifood'
import { revalidatePath } from 'next/cache'
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
    body.append('grant_type', 'client_credentials') // ⚠️ snake_case!
    body.append('client_id', clientId ?? '')
    body.append('client_secret', clientSecret ?? '')

    const response = await fetch(`${api}/authentication/v1.0/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const contentType = response.headers.get('content-type')
    const raw = await response.text()

    if (!response.ok || !contentType?.includes('application/json')) {
      console.error(
        '[REFRESH_TOKEN] Erro ao obter token: status',
        response.status,
      )
      console.error(
        '[REFRESH_TOKEN] Corpo (provavelmente HTML):',
        raw.slice(0, 300),
      )
      throw new Error('Erro ao obter token do iFood')
    }

    let data: any
    try {
      data = JSON.parse(raw)
    } catch (e) {
      console.error('[REFRESH_TOKEN] Erro ao parsear JSON:', e)
      throw new Error('Resposta inválida do iFood')
    }

    if (!data.accessToken) {
      console.error('[REFRESH_TOKEN] Token ausente na resposta:', data)
      throw new Error('Token não retornado pelo iFood')
    }

    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expiresIn)

    const { error } = await supabase
      .from('ifood_integrations')
      .update({
        access_token: data.accessToken,
        expires_at: expiresAt.toISOString(),
      })
      .eq('merchant_id', merchantId)

    if (error) {
      console.error('❌ Erro ao atualizar token no banco:', error)
      throw new Error('Erro ao salvar token no banco')
    }

    console.log(
      '[REFRESH_TOKEN] Token atualizado com sucesso:',
      data.accessToken,
    )
    return [data.accessToken]
  })

export const getAccessToken = webhookProcedure
  .createServerAction()
  .input(z.object({ merchantId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { merchantId } = input
    const { supabase } = ctx

    console.log(`[TOKEN] Iniciando busca do token para merchant: ${merchantId}`)

    const { data, error } = await supabase
      .from('ifood_integrations')
      .select('access_token, expires_at')
      .eq('merchant_id', merchantId)
      .single()

    if (error) {
      console.error(
        `[TOKEN] Erro ao buscar token do banco para ${merchantId}:`,
        error,
      )
    }

    if (!data?.access_token) {
      console.warn(
        `[TOKEN] Token não encontrado para ${merchantId}, tentando gerar novo...`,
      )
      try {
        const [newToken] = await refreshAccessToken({ merchantId })
        console.log(
          `[TOKEN] Novo token gerado com sucesso para ${merchantId}: ${newToken?.slice(0, 10)}...`,
        )
        return newToken
      } catch (err) {
        console.error(
          `[TOKEN] Falha ao gerar novo token para ${merchantId}:`,
          err,
        )
        throw new Error('Erro ao gerar novo token.')
      }
    }

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now >= expiresAt) {
      console.warn(
        `[TOKEN] Token expirado para ${merchantId}. Tentando renovação...`,
      )
      try {
        const [newToken] = await refreshAccessToken({ merchantId })
        console.log(
          `[TOKEN] Token renovado com sucesso para ${merchantId}: ${newToken?.slice(0, 10)}...`,
        )
        return newToken
      } catch (err) {
        console.error(`[TOKEN] Falha ao renovar token para ${merchantId}:`, err)
        throw new Error('Erro ao renovar token expirado.')
      }
    }

    console.log(
      `[TOKEN] Token válido encontrado para ${merchantId}. Expira em ${data.expires_at}`,
    )
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
  return NextResponse.json({
    message: 'Evento KEEPALIVE recebido.',
  })
})

export const createHandshakeEvent = webhookProcedure
  .createServerAction()
  .input(IfoodHandshakeDisputeSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase.from('ifood_events').upsert(input).select()

    if (error) {
      console.error('Erro ao salvar evento de handshake:', error)
    }

    revalidatePath('/')

    return NextResponse.json({
      message: 'Evento de handshake tratado com sucesso!',
    })
  })
