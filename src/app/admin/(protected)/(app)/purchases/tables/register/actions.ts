'use server'

import { updateAmountSoldAndStock } from '@/app/[public_store]/checkout/@summary/actions'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createTableSchema, updateTableSchema } from './schemas'

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
  .input(updateTableSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    // Variáveis auxiliares
    let oldItems: { product_id: string; quantity: number }[] = []

    if (input.is_edit) {
      // 1. Buscar os itens antigos antes de deletar
      const { data, error: fetchOldError } = await supabase
        .from('purchase_items')
        .select('product_id, quantity')
        .eq('table_id', input.id)

      if (fetchOldError) {
        console.error('Erro ao buscar itens antigos da mesa', fetchOldError)
        return
      }

      oldItems = data ?? []

      // 2. Deleta os itens antigos
      const { error: deleteError } = await supabase
        .from('purchase_items')
        .delete()
        .eq('table_id', input.id)

      if (deleteError) {
        console.error('Erro ao remover itens antigos da mesa', deleteError)
        return
      }
    }

    // 3. Insere os novos
    const { data: newItems, error: insertError } = await supabase
      .from('purchase_items')
      .insert(
        input.purchase_items.map((item) => ({
          table_id: input.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product_price: item.product_price,
          observations: item.observations,
          extras: item.extras,
        })),
      )
      .select()

    if (insertError) {
      console.error('Erro ao inserir novos itens na mesa', insertError)
      return
    }

    // 4. Atualiza o estoque e vendidos com base na diferença
    const quantityDiffByProduct: Record<string, number> = {}

    for (const item of oldItems) {
      quantityDiffByProduct[item.product_id] =
        (quantityDiffByProduct[item.product_id] ?? 0) - item.quantity
    }

    for (const item of newItems ?? []) {
      quantityDiffByProduct[item.product_id] =
        (quantityDiffByProduct[item.product_id] ?? 0) + item.quantity
    }

    // 5. Aplica as diferenças nos produtos
    for (const [productId, diff] of Object.entries(quantityDiffByProduct)) {
      await updateAmountSoldAndStock(productId, diff)
    }

    revalidatePath('/admin/purchases')
  })
