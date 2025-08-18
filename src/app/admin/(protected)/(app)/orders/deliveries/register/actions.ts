'use server'

import { updateAmountSoldAndStock } from '@/app/[public_store]/checkout/@summary/actions'
import { stringToNumber } from '@/lib/utils'
import { adminProcedure } from '@/lib/zsa-procedures'
import { redirect } from 'next/navigation'
import {
  printOrderReceipt,
  readPrintingSettings,
} from '../../../config/printing/actions'
import { createOrderFormSchema, updateOrderFormSchema } from './schemas'

import { StoreType } from '@/models/store'
import { cache } from 'react'

export const getNextDisplayId = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx

    const { data, error } = await supabase.rpc('get_next_display_id', {
      input_store_id: store?.id,
    })

    if (error || typeof data !== 'number') {
      throw new Error(error?.message || 'Erro ao gerar display_id')
    }

    return data // current_sequence retornado
  })

export const createOrder = adminProcedure
  .createServerAction()
  .input(createOrderFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    // 1. Monte total e itens **antes** de tocar no DB
    const total = {
      subtotal: input.total.subtotal,
      total_amount: input.total.total_amount,
      shipping_price: input.type !== 'TAKEOUT' ? input.total.shipping_price : 0,
      change_value: input.total.change_value
        ? stringToNumber(input.total.change_value)
        : null,
      discount: input.total.discount
        ? stringToNumber(input.total.discount)
        : null,
    }

    const deliveryFee =
      input.type === 'DELIVERY'
        ? {
            product_id: null, // sinalizador interno de delivery
            quantity: 1,
            product_price: input.total.shipping_price,
            observations: [],
            extras: [],
          }
        : null

    const items = input.order_items
      .map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_price: item.product_price,
        observations: item.observations,
        extras: item.extras,
      }))
      .concat(deliveryFee ? [deliveryFee] : [])

    const [displayId] = await getNextDisplayId()

    // 2. Crie o pedido, buscando *só* o id
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        display_id: displayId,
        customer_id: input.customer_id,
        status: input.status,
        store_id: store.id,
        type: input.type,
        payment_type: input.payment_type,
        observations: input.observations,
        total,
        delivery: {
          time: input.type === 'DELIVERY' ? store.delivery_time : null,
          address: input.delivery.address,
        },
      })
      .select('id') // ← só precisamos do ID aqui
      .single()

    if (orderError || !orderData) {
      console.error('Erro criando order', orderError)
      return
    }
    const orderId = orderData.id

    // 3. Dispare em paralelo: inserção de itens + leitura de printSettings
    const insertItems = supabase
      .from('order_items')
      .insert(items.map((it) => ({ ...it, order_id: orderId })))
      .select('id,product_id,quantity')

    const readPrintSettings = readPrintingSettings()

    const [{ data: createdItems, error: itemsError }, [printSettingsData]] =
      await Promise.all([insertItems, readPrintSettings])

    if (itemsError || !createdItems) {
      console.error('Erro inserindo items', itemsError)
      return
    }

    // 4. Atualize estoque **concor­rentemente**
    await Promise.all(
      createdItems.map(({ product_id: productId, quantity }) =>
        updateAmountSoldAndStock(productId, quantity),
      ),
    )

    // 5. Se auto_print, só enfileire sem bloquear o fluxo
    const autoPrint = printSettingsData?.printingSettings.auto_print
    if (autoPrint) {
      printOrderReceipt({
        orderId,
        orderType: input.type,
        reprint: false,
      }).catch((err) =>
        console.error('Erro ao gerar impressão automática:', err),
      )
    }

    // 6. Redirect final
    redirect('/admin/orders?tab=deliveries')
  })

export const updateOrder = adminProcedure
  .createServerAction()
  .input(updateOrderFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    // 1. Monte total e itens antes de tocar no banco
    const total = {
      subtotal: input.total.subtotal,
      total_amount: input.total.total_amount,
      shipping_price: input.type !== 'TAKEOUT' ? input.total.shipping_price : 0,
      change_value: input.total.change_value
        ? stringToNumber(input.total.change_value)
        : 0,
      discount: input.total.discount ? stringToNumber(input.total.discount) : 0,
    }

    const alreadyHasDeliveryFee = input.order_items.some(
      (item) =>
        !item.product_id &&
        item.product_price === input.total.shipping_price &&
        (!item.extras || item.extras.length === 0),
    )

    const deliveryFee =
      input.type === 'DELIVERY' && !alreadyHasDeliveryFee
        ? {
            // identificador interno de delivery fee
            product_id: null,
            quantity: 1,
            product_price: input.total.shipping_price,
            observations: [],
            extras: [],
          }
        : null

    const itemsPayload = input.order_items
      .map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_price: item.product_price,
        observations: item.observations,
        extras: item.extras,
      }))
      .concat(deliveryFee ? [deliveryFee] : [])

    // 2. Delete antigo e, em sequência, faça o update de order pegando só o ID
    const { error: deleteErr } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', input.id)

    if (deleteErr) {
      console.error('Erro ao deletar itens:', deleteErr)
      return
    }

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({
        store_id: store.id,
        type: input.type,
        payment_type: input.payment_type,
        observations: input.observations,
        total,
        delivery: {
          time: input.type === 'DELIVERY' ? store.delivery_time : null,
          address: input.delivery.address,
        },
      })
      .eq('id', input.id)
      .select('id') // ← só precisamos do ID aqui
      .single()

    if (updateErr || !updated) {
      console.error('Erro ao atualizar order:', updateErr)
      return
    }
    const orderId = updated.id

    // 3. Dispare em paralelo: insert de itens e leitura de printSettings
    const insertItems = supabase
      .from('order_items')
      .insert(itemsPayload.map((it) => ({ ...it, order_id: orderId })))
      .select('product_id,quantity')

    const readSettings = readPrintingSettings()

    const [{ data: newItems, error: itemsErr }, [settingsData]] =
      await Promise.all([insertItems, readSettings])

    if (itemsErr || !newItems) {
      console.error('Erro ao inserir novos itens:', itemsErr)
      return
    }

    // 4. Atualize estoque e vendas em paralelo
    await Promise.all(
      newItems.map(({ product_id: productId, quantity }) =>
        updateAmountSoldAndStock(productId, quantity),
      ),
    )

    // 5. Se auto_print, enfileire sem await
    const autoPrint = settingsData?.printingSettings.auto_print
    if (autoPrint) {
      printOrderReceipt({
        orderId,
        orderType: input.type,
        reprint: true,
      }).catch((err) =>
        console.error('Erro ao gerar impressão automática:', err),
      )
    }

    // 6. Redirect final
    redirect('/admin/orders?tab=deliveries')
  })

export const readStoreData = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store } = ctx

    return {
      store: store as StoreType,
    }
  })

export const readStoreDataCached = cache(readStoreData)
