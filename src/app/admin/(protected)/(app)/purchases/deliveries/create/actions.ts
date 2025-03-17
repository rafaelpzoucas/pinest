'use server'

import { updateAmountSoldAndStock } from '@/app/[public_store]/checkout/@summary/actions'
import { stringToNumber } from '@/lib/utils'
import { adminProcedure } from '@/lib/zsa-procedures'
import { createPurchaseFormSchema } from './schemas'

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
          total_amount: input.total_amount,
          updated_at: new Date().toISOString(),
          store_id: store?.id,
          shipping_price: input.type !== 'pickup' ? input.shipping_price : 0,
          delivery_time:
            input.type === 'delivery' ? store?.delivery_time : null,
          type: input.type,
          payment_type: input.payment_type,
          change_value: input.change_value
            ? stringToNumber(input.change_value)
            : null,
          discount: input.discount ? stringToNumber(input.discount) : null,
          accepted: input.accepted,
        })
        .select()

    if (createdPurchaseError) {
      console.error('Não foi possível criar o pedido.', createdPurchaseError)
      return
    }

    const { data: purchaseItems, error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .insert(
        input.purchase_items.map((item) => ({
          purchase_id: createdPurchase[0].id,
          product_id: item?.product_id,
          quantity: item?.quantity,
          product_price: item?.product_price,
          observations: item?.observations,
          extras: item.extras,
        })),
      )
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

    return { createdPurchase }
  })
