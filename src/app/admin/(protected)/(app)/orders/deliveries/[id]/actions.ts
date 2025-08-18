'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
import { OrderType } from '@/models/order'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import { getValidIfoodAccessToken } from '../../../config/integrations/ifood/actions'

export const verifyIsIfood = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { orderId } = input

    const { data: order, error: readOrderError } = await supabase
      .from('orders')
      .select('is_ifood')
      .eq('id', orderId)
      .single()

    if (readOrderError || !order) {
      console.error('Erro ao buscar o pedido', readOrderError)
      return
    }

    return order.is_ifood
  })

export const readOrderById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { data: order, error: readOrderError } = await supabase
      .from('orders')
      .select(
        `
          *,
          order_items (
            *,
            products (
              *,
              product_images (*)
            ),
            order_item_variations (
              *,
              product_variations (*)
            )
          ),
          store_customers (
            *,
            customers (*)
          )
        `,
      )
      .eq('id', input.id)
      .single()

    if (readOrderError) {
      console.error('Error reading order.', readOrderError)
      return
    }

    return { order: order as OrderType }
  })

export const readOrderByIdCached = cache(readOrderById)

export const acceptOrder = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx
    const { orderId } = input

    await updateIfoodOrderStatus({ orderId, newStatus: 'preparing' })

    const { error: updateStatusError } = await supabase
      .from('orders')
      .update({ status: 'preparing' })
      .eq('id', orderId)

    if (updateStatusError) {
      console.error(updateStatusError)
    }

    revalidatePath('/orders')
  })

export const cancelOrder = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { error: updateStatusError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', input.orderId)

    if (updateStatusError) {
      console.error(updateStatusError)
    }

    revalidatePath('/orders')
  })

export const updateOrderPrintedItems = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    // Update em lote: marca todos os itens do pedido como impressos de uma vez
    const { error } = await supabase
      .from('order_items')
      .update({ printed: true })
      .eq('order_id', input.orderId)

    if (error) {
      console.error('Error updating printed status of order items.', error)
      return
    }

    revalidatePath('/')
  })

export async function updateDiscount(orderId: string, discount: number) {
  const supabase = createClient()

  const { error } = await supabase
    .from('orders')
    .update({ discount })
    .eq('id', orderId)

  if (error) {
    console.error('Erro ao atualizar o desconto: ', error)
  }

  revalidatePath('/admin/orders')
}

export const updateOrderStatus = adminProcedure
  .createServerAction()
  .input(
    z.object({
      newStatus: z.string(),
      orderId: z.string(),
      isIfood: z.boolean(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error: updateStatusError } = await supabase
      .from('orders')
      .update({ status: input.newStatus })
      .eq('id', input.orderId)

    if (updateStatusError) {
      console.error('Erro ao atualizar o status.', updateStatusError)
    }

    revalidatePath('/orders')

    if (!input.isIfood) return null
    await updateIfoodOrderStatus({
      orderId: input.orderId,
      newStatus: input.newStatus,
    })
  })

export const updateIfoodOrderStatus = adminProcedure
  .createServerAction()
  .input(z.object({ orderId: z.string(), newStatus: z.string() }))
  .handler(async ({ input }) => {
    const { orderId } = input

    const isIfood = await verifyIsIfood({ orderId })

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
        `${api}/order/v1.0/orders/${orderId}/${newStatusMap[status]}`,
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

      console.log('Pedido atualizado com sucesso', response.status)
    } catch (error) {
      console.error('Erro ao fazer a requisição', error)
      throw new Error('Erro ao fazer a requisição de atualização do pedido.')
    }
  })
