'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getValidIfoodAccessToken } from '../../../integrations/ifood/actions'

export const verifyIsIfood = adminProcedure
  .createServerAction()
  .input(z.object({ purchaseId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { purchaseId } = input

    const { data: purchase, error: readPurchaseError } = await supabase
      .from('purchases')
      .select('is_ifood')
      .eq('id', purchaseId)
      .single()

    if (readPurchaseError || !purchase) {
      console.error('Erro ao buscar o pedido', readPurchaseError)
      return
    }

    return purchase.is_ifood
  })

export const readPurchaseById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { data: purchase, error: readPurchaseError } = await supabase
      .from('purchases')
      .select(
        `
      *,
      purchase_items (
        *,
        products (*)
      ),
      purchase_item_variations (
        *,
        product_variations (*)
      ),
      customers (
        *,
        users (*)
      ),
      addresses (*)
      `,
      )
      .eq('id', input.id)
      .single()

    if (readPurchaseError || !purchase) {
      console.error('Error reading purchase.', readPurchaseError)
      return
    }

    return { purchase }
  })

export const acceptPurchase = adminProcedure
  .createServerAction()
  .input(z.object({ purchaseId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { purchaseId } = input

    await updateIfoodOrderStatus({ purchaseId, newStatus: 'pending' })

    const { error: updateStatusError } = await supabase
      .from('purchases')
      .update({ accepted: true, status: 'pending' })
      .eq('id', purchaseId)

    if (updateStatusError) {
      console.error(updateStatusError)
    }

    revalidatePath('/purchases')
  })

export const cancelPurchase = adminProcedure
  .createServerAction()
  .input(z.object({ purchaseId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { error: updateStatusError } = await supabase
      .from('purchases')
      .update({ status: 'cancelled' })
      .eq('id', input.purchaseId)

    if (updateStatusError) {
      console.error(updateStatusError)
    }

    revalidatePath('/purchases')
  })

export const updatePurchasePrintedItems = adminProcedure
  .createServerAction()
  .input(z.object({ purchaseId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: purchaseItems, error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .select('*')
      .eq('purchase_id', input.purchaseId)

    if (purchaseItemsError || !purchaseItems) {
      console.error('Error reading purchase items', purchaseItemsError)
      return
    }

    for (const item of purchaseItems) {
      const { error } = await supabase
        .from('purchase_items')
        .update({ printed: true })
        .eq('id', item.id)

      if (error) {
        console.error('Error updating printed status of purchase item.', error)
      }
    }

    revalidatePath('/')
  })

export async function updateDiscount(purchaseId: string, discount: number) {
  const supabase = createClient()

  const { error } = await supabase
    .from('purchases')
    .update({ discount })
    .eq('id', purchaseId)

  if (error) {
    console.error('Erro ao atualizar o desconto: ', error)
  }

  revalidatePath('/admin/purchases')
}

export async function updatePurchaseStatus(
  newStatus: string,
  purchaseId: string,
  isIfood: boolean,
) {
  const supabase = createClient()

  const { error: updateStatusError } = await supabase
    .from('purchases')
    .update({ status: newStatus })
    .eq('id', purchaseId)

  if (updateStatusError) {
    console.error(updateStatusError)
  }

  revalidatePath('/purchases')

  if (!isIfood) return null
  await updateIfoodOrderStatus({ purchaseId, newStatus })
}

export const updateIfoodOrderStatus = adminProcedure
  .createServerAction()
  .input(z.object({ purchaseId: z.string(), newStatus: z.string() }))
  .handler(async ({ input }) => {
    const { purchaseId } = input

    const isIfood = await verifyIsIfood({ purchaseId })

    // Verifica se o pedido é do iFood
    if (!isIfood) {
      return
    }

    const api = process.env.IFOOD_API_BASE_URL

    const [accessToken] = await getValidIfoodAccessToken()

    if (!accessToken?.success) {
      console.error(
        'Erro ao buscar access_token no banco.',
        accessToken?.message,
      )
      return
    }

    const newStatusMap = {
      pending: 'confirm',
      preparing: 'startPreparation',
      readyToPickup: 'readyToPickup',
      shipped: 'dispatch',
      cancelled: 'cancelled',
    } as const

    type Status = keyof typeof newStatusMap

    const status: Status = input.newStatus as Status

    try {
      // Enviar a requisição para o iFood
      const response = await fetch(
        `${api}/order/v1.0/orders/${purchaseId}/${newStatusMap[status]}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken?.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        console.error('Erro ao atualizar o pedido', response.statusText)
        throw new Error('Erro ao atualizar o pedido no iFood.')
      }

      const responseData = await response.json()
      console.log('Pedido atualizado com sucesso', responseData)
    } catch (error) {
      console.error('Erro ao fazer a requisição', error)
      throw new Error('Erro ao fazer a requisição de atualização do pedido.')
    }
  })
