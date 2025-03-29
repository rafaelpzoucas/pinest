'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
import { UserType } from '@/models/user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { refreshIfoodAccessToken } from './purchases/deliveries/data-table/actions'

export async function readOwner(): Promise<{
  owner: UserType | null
  ownerError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: owner, error: ownerError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user?.id)
    .single()

  return { owner, ownerError }
}

export const updateStoreStatus = adminProcedure
  .createServerAction()
  .input(z.object({ isOpen: z.boolean() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('stores')
      .update({ is_open_override: input.isOpen, is_open: input.isOpen })
      .eq('id', store.id)

    if (error || !data) {
      console.error('Erro ao atualizar status da loja.', error)
      return null
    }

    revalidatePath('/')

    return { data }
  })

export const readLastEvents = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: integration, error: integrationError } = await supabase
      .from('ifood_integrations')
      .select('*')
      .eq('store_id', store.id)
      .single()

    if (integrationError || !integration) {
      console.error('Erro ao buscar integração da loja.', integrationError)
      return null
    }

    const { data: events, error: eventError } = await supabase
      .from('ifood_events')
      .select('*')
      .eq('merchantId', integration.merchant_id)
      .order('createdAt', { ascending: false })

    if (eventError || !events) {
      console.error('Erro ao buscar eventos.', eventError)
      return null
    }

    return { events }
  })

export const handleDisputeAction = adminProcedure
  .createServerAction()
  .input(
    z
      .object({
        disputeId: z.string(),
        action: z.enum(['accept', 'reject']),
        reason: z.string(),
      })
      .refine(
        (data) =>
          data.action === 'accept' ||
          (data.action === 'reject' && !!data.reason),
        {
          message: 'Reason é obrigatório quando action for reject',
          path: ['reason'],
        },
      ),
  )
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const api = process.env.IFOOD_API_BASE_URL

    const { data: ifood, error: ifoodError } = await supabase
      .from('ifood_integrations')
      .select('*')
      .eq('store_id', store.id)
      .single()

    if (ifoodError || !ifood) {
      console.error('Nenhuma integração com ifood encontrada.')
      return null
    }

    const now = new Date()
    const expiresAt = new Date(ifood.expires_at)

    if (now >= expiresAt) {
      await refreshIfoodAccessToken(store.id)
    }

    const body =
      input.action === 'reject'
        ? JSON.stringify({ reason: input.reason })
        : '{}'

    const response = await fetch(
      `${api}/order/v1.0/disputes/${input.disputeId}/${input.action}`,
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
    }
  })

export const readStoreSubscriptionStatus = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('store_id', store.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError) {
      console.error('Erro ao buscar dados da assinatura.', subscriptionError)
      return null
    }

    return { subscriptionStatus: subscription.status }
  })

export const readStorePlan = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('store_id', store.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError || !subscription) {
      console.error('Erro ao buscar dados da assinatura.', subscriptionError)
      return null
    }

    if (subscription.status !== 'active') {
      console.error('Plano inativo.')
      return null
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', subscription?.plan_id)
      .single()

    if (planError || !plan) {
      console.error('Erro ao buscar dados do plano.', planError)
      return null
    }

    return { plan }
  })

export const isPermissionGranted = adminProcedure
  .createServerAction()
  .input(z.object({ feature: z.string() }))
  .handler(async ({ input }) => {
    const [planData] = await readStorePlan()

    return { granted: planData?.plan.features[input.feature] ?? false }
  })
