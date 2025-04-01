'use server'

import { updateAmountSoldAndStock } from '@/app/[public_store]/checkout/@summary/actions'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createTableSchema } from './schemas'

export const checkTableExists = adminProcedure
  .createServerAction()
  .input(z.object({ number: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data: existingTable, error: readExistingTablesError } =
      await supabase
        .from('tables')
        .select('*')
        .eq('store_id', store.id)
        .eq('number', input.number)
        .eq('status', 'open')
        .single()

    if (readExistingTablesError && !existingTable) {
      console.error('Error reading existing tables', readExistingTablesError)
      return false
    }

    return true
  })

export const createTable = adminProcedure
  .createServerAction()
  .input(createTableSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store } = ctx

    const { data: createdTable, error: createTableError } = await supabase
      .from('tables')
      .insert({
        number: parseInt(input.number),
        description: input.description,
        store_id: store?.id,
      })
      .select()
      .single()

    if (createTableError || !createdTable) {
      console.error('Não foi possível criar a mesa.', createTableError)
      return
    }

    const { data: purchaseItems, error: purchaseItemsError } = await supabase
      .from('purchase_items')
      .insert(
        input.purchase_items.map((item) => ({
          table_id: createdTable.id,
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
        'Não foi possível adicionar os itens à mesa.',
        purchaseItemsError,
      )
      return
    }

    if (purchaseItems) {
      for (const item of purchaseItems) {
        await updateAmountSoldAndStock(item.product_id, item.quantity)
      }
    }

    revalidatePath('/admin/purchases')

    return { createdTable }
  })

export const updateTable = adminProcedure
  .createServerAction()
  .input(createTableSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: updatedItems, error: updatedItemsError } = await supabase
      .from('purchase_items')
      .insert(
        input.purchase_items.map((item) => ({
          table_id: input.id,
          product_id: item?.product_id,
          quantity: item?.quantity,
          product_price: item?.product_price,
          observations: item?.observations,
          extras: item.extras,
        })),
      )
      .select()

    if (updatedItemsError) {
      console.error(
        'Não foi possível adicionar os itens à mesa.',
        updatedItemsError,
      )
      return
    }

    if (updatedItems) {
      for (const item of updatedItems) {
        await updateAmountSoldAndStock(item.product_id, item.quantity)
      }
    }

    revalidatePath('/admin/purchases')

    return { updatedItems }
  })
