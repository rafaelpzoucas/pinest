'use server'

import { updateAmountSoldAndStock } from '@/app/[public_store]/checkout/@summary/actions'
import { stringToNumber } from '@/lib/utils'
import { adminProcedure } from '@/lib/zsa-procedures'
import { PurchaseType } from '@/models/purchase'
import {
  printPurchaseReceipt,
  readPrintingSettings,
} from '../../../config/printing/actions'
import { createPurchaseFormSchema, updatePurchaseFormSchema } from './schemas'

export const createPurchase = adminProcedure
  .createServerAction()
  .input(createPurchaseFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data: createdPurchase, error: createdPurchaseError } =
      await supabase
        .from('purchases')
        .insert({
          customer_id: input.customer_id,
          status: input.status,
          updated_at: new Date().toISOString(),
          store_id: store?.id,
          type: input.type,
          payment_type: input.payment_type,
          observations: input.observations,
          total: {
            subtotal: input.total.subtotal,
            total_amount: input.total.total_amount,
            shipping_price:
              input.type !== 'TAKEOUT' ? input.total.shipping_price : 0,
            change_value: input.total.change_value
              ? stringToNumber(input.total.change_value)
              : null,
            discount: input.total.discount
              ? stringToNumber(input.total.discount)
              : null,
          },
          delivery: {
            time: input.type === 'DELIVERY' ? store?.delivery_time : null,
            address: input.delivery.address,
          },
        })
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
            store_customers (
              *,
              customers (*)
            )
          `,
        )
        .single()

    if (createdPurchaseError) {
      console.error('Não foi possível criar o pedido.', createdPurchaseError)
      return
    }

    const deliveryFee =
      input.type === 'DELIVERY'
        ? {
            purchase_id: createdPurchase.id,
            is_paid: false,
            description: 'Taxa de entrega',
            product_price: input.total.shipping_price,
            quantity: 1,
            observations: [],
            extras: [],
          }
        : null

    const purchaseItemsArray = [
      ...input.purchase_items.map((item) => ({
        purchase_id: createdPurchase.id,
        product_id: item?.product_id,
        quantity: item?.quantity,
        product_price: item?.product_price,
        observations: item?.observations,
        extras: item.extras,
      })),
      ...(deliveryFee ? [deliveryFee] : []),
    ]

    const { data: purchaseItems, error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItemsArray)
      .select()

    if (purchaseItemsError) {
      console.error(
        'Não foi possível adicionar os itens ao pedido.',
        purchaseItemsError,
      )
      return
    }

    if (purchaseItems) {
      for (const item of purchaseItems) {
        await updateAmountSoldAndStock(item.product_id, item.quantity)
      }
    }
    const [printSettingsData] = await readPrintingSettings()
    const printSettings = printSettingsData?.printingSettings

    if (printSettings?.auto_print) {
      await printPurchaseReceipt({
        purchaseId: createdPurchase.id,
        reprint: false,
      })
    }

    return { createdPurchase: createdPurchase as PurchaseType }
  })

export const updatePurchase = adminProcedure
  .createServerAction()
  .input(updatePurchaseFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { error: deleteItemsError } = await supabase
      .from('purchase_items')
      .delete()
      .eq('purchase_id', input.id)

    if (deleteItemsError) {
      console.error('Erro ao deletar itens do pedido.', deleteItemsError)
      return
    }

    const { data: updatedPurchase, error: updatedPurchaseError } =
      await supabase
        .from('purchases')
        .update({
          updated_at: new Date().toISOString(),
          store_id: store?.id,
          type: input.type,
          payment_type: input.payment_type,
          observations: input.observations,
          total: {
            subtotal: input.total.subtotal,
            total_amount: input.total.total_amount,
            shipping_price:
              input.type !== 'TAKEOUT' ? input.total.shipping_price : 0,
            change_value: input.total.change_value
              ? stringToNumber(input.total.change_value)
              : 0,
            discount: input.total.discount
              ? stringToNumber(input.total.discount)
              : 0,
          },
          delivery: {
            time: input.type === 'DELIVERY' ? store?.delivery_time : null,
            address: input.delivery.address,
          },
        })
        .eq('id', input.id)
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
            store_customers (
              *,
              customers (*)
            )
          `,
        )
        .single()

    if (updatedPurchaseError) {
      console.error('Não foi possível criar o pedido.', updatedPurchaseError)
      return
    }

    const alreadyHasDeliveryFee = input.purchase_items.some((item) => {
      const isPossiblyDeliveryFee =
        !item.product_id &&
        item.product_price === input.total.shipping_price &&
        (!item.extras || item.extras.length === 0)

      return isPossiblyDeliveryFee
    })

    const deliveryFee =
      input.type === 'DELIVERY' && !alreadyHasDeliveryFee
        ? {
            purchase_id: updatedPurchase.id,
            is_paid: false,
            description: 'Taxa de entrega',
            product_price: input.total.shipping_price,
            quantity: 1,
            observations: [],
            extras: [],
          }
        : null

    const purchaseItemsArray = [
      ...input.purchase_items.map((item) => ({
        purchase_id: updatedPurchase.id,
        product_id: item?.product_id,
        quantity: item?.quantity,
        product_price: item?.product_price,
        observations: item?.observations,
        extras: item.extras,
      })),
      ...(deliveryFee ? [deliveryFee] : []),
    ]

    const { data: purchaseItems, error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .insert(purchaseItemsArray)
      .select()

    if (purchaseItemsError) {
      console.error(
        'Não foi possível adicionar os itens ao pedido.',
        purchaseItemsError,
      )
      return
    }

    if (purchaseItems) {
      for (const item of purchaseItems) {
        await updateAmountSoldAndStock(item.product_id, item.quantity)
      }
    }

    const [printSettingsData] = await readPrintingSettings()
    const printSettings = printSettingsData?.printingSettings

    if (printSettings?.auto_print) {
      await printPurchaseReceipt({
        purchaseId: updatedPurchase.id,
        reprint: true,
      })
    }

    return {
      updatedPurchase: {
        ...updatedPurchase,
        purchase_items: purchaseItems,
      } as PurchaseType,
    }
  })
