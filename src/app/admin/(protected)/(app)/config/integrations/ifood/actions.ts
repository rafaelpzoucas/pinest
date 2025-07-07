'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { InsertMerchantIdFormSchema } from './schemas'

export const getValidIfoodAccessToken = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    // 🔹 1. Buscar token no banco
    const { data, error } = await supabase
      .from('ifood_integrations')
      .select('access_token, expires_at')
      .eq('store_id', store.id)
      .single()

    if (error || !data?.access_token) {
      console.error('🔄 Token não encontrado.', error)
      return await refreshIfoodAccessToken(ctx)
    }

    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    // 🔹 2. Se o token estiver expirado, buscar um novo
    if (now >= expiresAt) {
      console.error('🔄 Token expirado.')
      return await refreshIfoodAccessToken(ctx)
    }

    // 🔹 3. Retornar o token válido
    return { success: true, accessToken: data.access_token }
  })

export const refreshIfoodAccessToken = async (ctx: any) => {
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
    const { error } = await ctx.supabase
      .from('ifood_integrations')
      .update({
        access_token: data.accessToken,
        expires_at: expiresAt.toISOString(),
      })
      .eq('store_id', ctx.store.id)

    if (error) {
      console.error('❌ Erro ao atualizar token no banco:', error)
      return { success: false, message: 'Erro ao salvar token' }
    }

    return { success: true, accessToken: data.accessToken }
  }

  return { success: false, message: 'Erro ao obter token do iFood' }
}

export const getIfoodMerchantId = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data, error } = await supabase
      .from('ifood_integrations')
      .select('merchant_id')
      .eq('store_id', store.id)
      .single()

    if (error || !data) {
      console.error('Merchant ID não encontrado.')
      return null
    }

    return { merchant_id: data.merchant_id }
  })

export const insertIfoodMerchantId = adminProcedure
  .createServerAction()
  .input(InsertMerchantIdFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { error } = await supabase
      .from('ifood_integrations')
      .insert({ merchant_id: input.merchant_id, store_id: store.id })
      .eq('store_id', store.id)

    if (error) {
      console.error('Erro ao salvar o merchant_id.', error)
      return { success: false }
    }

    await getValidIfoodAccessToken()

    revalidatePath('/')

    return { success: true }
  })
