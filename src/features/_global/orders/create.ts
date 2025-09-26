'use server'

import { notifySchema, NotifyType } from '@/app/api/v1/push/schemas'
import { createClient } from '@/lib/supabase/server'
import { createPath } from '@/utils/createPath'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'
import { getNextDisplayId } from './get_next_display_id'
import { createOrderSchema, OrderItem } from './schemas'

// Função auxiliar que cria o pedido sem fazer redirect
async function createOrderInternal(input: z.infer<typeof createOrderSchema>) {
  const supabase = createClient()

  const [displayIdData] = await Promise.all([
    getNextDisplayId({ storeId: input.store_id }),
  ])

  const orderItemsArray: OrderItem[] = input.order_items.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    product_price: item.product_price,
    observations: item.observations ?? [],
    extras: item.extras ?? [],
  }))

  if (input.type === 'DELIVERY' && input.total?.shipping_price) {
    orderItemsArray.push({
      is_paid: false,
      description: 'Taxa de entrega',
      product_price: input.total.shipping_price,
      product_id: null,
      quantity: 1,
      observations: [],
      extras: [],
    })
  }

  if (orderItemsArray.length === 0) {
    throw new ZSAError('NOT_FOUND', 'Nenhum item para inserir no pedido')
  }

  const { data: result, error: transactionError } = await supabase.rpc(
    'create_order_with_items_transaction',
    {
      order_data: { ...input, display_id: displayIdData[0] },
      order_items_data: orderItemsArray,
    },
  )

  if (transactionError) {
    throw new ZSAError('INTERNAL_SERVER_ERROR', transactionError.message)
  }

  const createdOrderId = result.order_id
  const createdOrderItems = result.items

  // Operações não-críticas em paralelo
  const promises = []

  if (createdOrderItems?.length > 0) {
    const stockUpdatePromise = updateAmountSoldAndStockSQL(
      (createdOrderItems as OrderItem[]).reduce<
        { product_id: string; quantity: number }[]
      >((acc, item) => {
        if (item.product_id) {
          acc.push({
            product_id: item.product_id,
            quantity: item.quantity,
          })
        }
        return acc
      }, []),
    ).catch((error) => {
      console.error('Erro na atualização de estoque (não crítico):', error)
    })
    promises.push(stockUpdatePromise)
  }

  if (input.customer_id && input.store_id) {
    const customerUpdatePromise = updateStoreCustomerOrdersQuantity({
      customerId: input.customer_id,
      storeId: input.store_id,
    }).catch((error) => {
      console.error('Erro na atualização do cliente (não crítico):', error)
    })
    promises.push(customerUpdatePromise)
  }

  // Notificação em paralelo
  nofityStore({ storeId: input.store_id }).catch((error) => {
    console.error('Erro na notificação (não crítico):', error)
  })

  await Promise.allSettled(promises)

  return {
    orderId: createdOrderId,
    redirectUrl: createPath(
      `/orders/${createdOrderId}?back=home`,
      input.store_subdomain,
    ),
  }
}

// Server action principal com redirect
export const createOrder = createServerAction()
  .input(createOrderSchema)
  .handler(async ({ input }) => {
    const result = await createOrderInternal(input)
    redirect(result.redirectUrl)
  })

// Server action alternativa que retorna dados sem redirect
export const createOrderWithoutRedirect = createServerAction()
  .input(createOrderSchema)
  .handler(async ({ input }) => {
    return await createOrderInternal(input)
  })

// Restante das funções auxiliares permanecem iguais
async function updateAmountSoldAndStockSQL(
  orderItems: Array<{ product_id: string; quantity: number }>,
) {
  const supabase = createClient()

  const validItems = orderItems.filter((item) => item.product_id)
  if (validItems.length === 0) return

  const quantityByProduct = validItems.reduce(
    (acc, item) => {
      acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity
      return acc
    },
    {} as Record<string, number>,
  )

  try {
    const { error } = await supabase.rpc('update_products_batch', {
      product_updates: Object.entries(quantityByProduct).map(
        ([id, quantity]) => ({
          product_id: id,
          quantity_diff: quantity,
        }),
      ),
    })

    if (error) {
      console.error('Erro ao executar atualização SQL em lote:', error)
    }
  } catch (error) {
    console.error('Erro inesperado na atualização SQL:', error)
  }
}

const updateStoreCustomerOrdersQuantity = createServerAction()
  .input(
    z.object({ customerId: z.string().optional(), storeId: z.string().uuid() }),
  )
  .handler(async ({ input }) => {
    const supabase = createClient()

    if (!input.customerId) {
      console.log('Customer ID não fornecido')
      return
    }

    const { error } = await supabase.rpc('increment_customer_orders', {
      p_customer_id: input.customerId,
      p_store_id: input.storeId,
    })

    if (error) {
      console.error(
        'Não foi possível atualizar a quantidade de pedidos do cliente.',
        error,
      )
    }
  })

export async function nofityStore(values: NotifyType) {
  const { description, storeId, title, url, icon } = notifySchema.parse(values)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/push/notify`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId,
        title: title ?? 'Novo pedido recebido',
        description: description ?? 'Você recebeu um novo pedido na sua loja!',
        url: url ?? '',
        icon,
      }),
      signal: AbortSignal.timeout(5000),
    },
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}
