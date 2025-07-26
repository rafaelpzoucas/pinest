'use server'

import { updateAmountSoldAndStock } from '@/app/[public_store]/checkout/@summary/actions'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { printTableReceipt } from '../../../config/printing/actions'
import { createTableSchema, updateTableSchema } from './schemas'

/**
 * 1) checkTableExists: só testa existência, sem trazer colunas.
 */
export const checkTableExists = adminProcedure
  .createServerAction()
  .input(z.object({ number: z.string() }))
  .handler(async ({ ctx: { supabase, store }, input }) => {
    const { data, error } = await supabase
      .from('tables')
      .select('id')
      .eq('store_id', store.id)
      .eq('number', input.number)
      .eq('status', 'open')

    if (error) {
      console.error('Erro lendo mesas:', error)
      return false
    }

    return (data.length ?? 0) > 0
  })

/**
 * 2) createTable: payload mínimo, paraleliza inserção de items e impressão.
 */
export const createTable = adminProcedure
  .createServerAction()
  .input(createTableSchema)
  .handler(async ({ ctx: { supabase, store }, input }) => {
    const [exists] = await checkTableExists({ number: input.number })

    if (exists) {
      throw new Error('Esta mesa já está aberta.')
    }
    // 1. Pré-monta tabela e items
    const tablePayload = {
      number: parseInt(input.number, 10),
      description: input.description,
      store_id: store.id,
    }

    const itemsPayload = input.purchase_items.map((item) => ({
      table_id: null, // será preenchido depois
      product_id: item.product_id,
      quantity: item.quantity,
      product_price: item.product_price,
      observations: item.observations,
      extras: item.extras,
    }))

    // 2. Cria apenas o ID da mesa
    const { data: tbl, error: tblErr } = await supabase
      .from('tables')
      .insert(tablePayload)
      .select('id')
      .single()

    if (tblErr || !tbl) {
      console.error('Erro criando mesa:', tblErr)
      return
    }
    const tableId = tbl.id

    // 3. Paraleliza inserção de items + impressão + revalidação
    const insertItems = supabase
      .from('purchase_items')
      .insert(itemsPayload.map((it) => ({ ...it, table_id: tableId })))
      .select('product_id, quantity')

    // não await — dispara em background
    printTableReceipt({ printerName: 'G250', tableId, reprint: false })

    // revalida sem await
    revalidatePath('/admin/purchases')

    // 4. Aguarda só a inserção dos items e distribui atualizações de estoque
    const { data: newItems, error: insErr } = await insertItems
    if (insErr) {
      console.error('Erro inserindo itens na mesa:', insErr)
      return
    }

    await Promise.all(
      newItems.map(({ product_id: productId, quantity }) =>
        updateAmountSoldAndStock(productId, quantity),
      ),
    )

    redirect('/admin/purchases?tab=tables')
  })

/**
 * 3) updateTable: lê antigos, deleta, insere novos e aplica diffs em paralelo.
 */
export const updateTable = adminProcedure
  .createServerAction()
  .input(updateTableSchema)
  .handler(async ({ ctx: { supabase }, input }) => {
    // 1. Se for edição, busca antigos antes de apagar
    let oldItems: { product_id: string; quantity: number }[] = []
    if (input.is_edit) {
      const { data: fetched, error: fetchErr } = await supabase
        .from('purchase_items')
        .select('product_id, quantity')
        .eq('table_id', input.id)

      if (fetchErr) {
        console.error('Erro buscando itens antigos:', fetchErr)
        return
      }
      oldItems = fetched || []

      const { error: delErr } = await supabase
        .from('purchase_items')
        .delete()
        .eq('table_id', input.id)
      if (delErr) {
        console.error('Erro deletando itens antigos:', delErr)
        return
      }
    }

    // 2. Pré-monta payload de novos items
    const newItemsPayload = input.purchase_items.map((item) => ({
      table_id: input.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product_price: item.product_price,
      observations: item.observations,
      extras: item.extras,
    }))

    // 3. Insere novos e, em paralelo, dispara impressão e revalidação
    const insertResult = supabase
      .from('purchase_items')
      .insert(newItemsPayload)
      .select('product_id, quantity')

    printTableReceipt({ printerName: 'G250', tableId: input.id, reprint: true })
    revalidatePath('/admin/purchases')

    // 4. Atualiza estoque com base no diff
    const { data: newItems, error: insErr } = await insertResult
    if (insErr) {
      console.error('Erro inserindo novos itens:', insErr)
      return
    }

    // calcula diffs
    const diffMap: Record<string, number> = {}
    oldItems.forEach(({ product_id: productId, quantity }) => {
      diffMap[productId] = (diffMap[productId] || 0) - quantity
    })
    newItems.forEach(({ product_id: productId, quantity }) => {
      diffMap[productId] = (diffMap[productId] || 0) + quantity
    })

    // aplica todas as atualizações de estoque em paralelo
    await Promise.all(
      Object.entries(diffMap).map(([productId, diff]) =>
        updateAmountSoldAndStock(productId, diff),
      ),
    )

    redirect('/admin/purchases?tab=tables')
  })
