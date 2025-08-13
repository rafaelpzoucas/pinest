'use server'

import { stringToNumber } from '@/lib/utils'
import { adminProcedure, cashProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import {
  closeCashSessionSchema,
  createCashReceiptsSchema,
  createTransactionFormSchema,
  openCashSessionSchema,
} from './schemas'

export const createCashSession = adminProcedure
  .createServerAction()
  .input(openCashSessionSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, user } = ctx

    const { data: cashSession, error: cashSessionError } = await supabase
      .from('cash_sessions')
      .insert({
        user_id: user?.id,
        store_id: store.id,
        opening_balance: stringToNumber(input.opening_balance),
      })
      .select()
      .single()

    if (cashSessionError) {
      console.error('Error creating cash session:', cashSessionError)
    }

    const { data: createdPayment, error } = await supabase
      .from('payments')
      .insert({
        amount: stringToNumber(input.opening_balance),
        status: 'confirmed',
        store_id: store.id,
        cash_session_id: cashSession.id,
        description: 'Abertura de caixa',
      })
      .select()

    if (error || !createdPayment) {
      console.error('Error creating payment transaction.', error)
      return
    }

    revalidatePath('/admin/cash-register')
  })

export const createCashSessionTransaction = cashProcedure
  .createServerAction()
  .input(createTransactionFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, cashSession } = ctx

    const { error: transactionError } = await supabase.from('payments').insert({
      ...input,
      store_id: store.id,
      cash_session_id: cashSession.id,
      amount: stringToNumber(input.amount),
    })

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
    }

    revalidatePath('/admin/cash-register')
  })

export const closeCashSession = cashProcedure
  .createServerAction()
  .input(closeCashSessionSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, cashSession } = ctx

    const { error } = await supabase
      .from('cash_sessions')
      .update({
        closing_balance: stringToNumber(input.closing_balance),
        closing_balance_cash: stringToNumber(input.cash_balance),
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', cashSession.id)

    if (error) {
      console.error('Error creating cash session:', error)
    }

    revalidatePath('/admin/cash-register')
  })

export const readCashSession = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, user } = ctx

    const { data: cashSession, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('store_id', store.id)
      .eq('user_id', user?.id)
      .eq('status', 'open')
      .single()

    if (error) {
      console.error('Error reading cash session:', error)
    }

    revalidatePath('/admin/cash-register')

    return { cashSession }
  })

export const readCashSessionPayments = cashProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store, cashSession } = ctx

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('store_id', store.id)
      .eq('cash_session_id', cashSession.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error reading cash session payments:', error)
    }

    return { payments }
  })

export const readPaymentsByCashSessionId = adminProcedure
  .createServerAction()
  .input(z.object({ cashSessionId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('cash_session_id', input.cashSessionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error reading cash session payments:', error)
    }

    return { payments }
  })

export const readOpenPurchases = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: openPurchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_paid', false)
      .neq('status', 'cancelled')

    if (error) {
      console.error('Error reading cash session payments:', error)
    }

    return { openPurchases }
  })

export const readOpenTables = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: openTables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('store_id', store.id)
      .neq('status', 'closed')

    if (error) {
      console.error('Error reading cash session payments:', error)
    }

    return { openTables }
  })

export const upsertCashReceipts = adminProcedure
  .createServerAction()
  .input(createCashReceiptsSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const [cashSessionData] = await readCashSession()
    const cashSession = cashSessionData?.cashSession

    if (!cashSession) {
      throw new Error('Sessão de caixa não encontrada')
    }

    if (!input.length) {
      // Se não há recibos enviados, não faz nada
      revalidatePath('/admin/cash-register')
      return
    }

    // Todos os recibos enviados devem ser do mesmo tipo
    const receiptType = input[0].type

    if (receiptType.startsWith('cash_')) {
      // Remove todos os recibos de dinheiro da sessão
      await supabase
        .from('cash_register_receipts')
        .delete()
        .eq('session_id', cashSession.id)
        .like('type', 'cash_%')
    } else {
      // Remove todos os recibos do mesmo tipo da sessão
      await supabase
        .from('cash_register_receipts')
        .delete()
        .eq('session_id', cashSession.id)
        .eq('type', receiptType)
    }

    // Insere os novos recibos
    const { data, error } = await supabase
      .from('cash_register_receipts')
      .insert(
        input.map((receipt) => ({
          ...receipt,
          session_id: cashSession.id,
          value: Number(receipt.value),
          amount: Number(receipt.amount),
          total: Number(receipt.total),
        })),
      )

    if (error) {
      throw new Error('Não foi possível adicionar o(s) recibo(s)', error)
    }

    console.log('Recibo(s) atualizado(s) com sucesso!', data)

    revalidatePath('/admin/cash-register')
  })

export const readCashReceipts = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase } = ctx

    const [cashSessionData] = await readCashSession()
    const cashSession = cashSessionData?.cashSession

    const { data, error } = await supabase
      .from('cash_register_receipts')
      .select('*')
      .eq('session_id', cashSession.id)

    if (error) {
      console.error('Não foi possível encontrar os recibos', error)
    }

    return { cashReceipts: data as z.infer<typeof createCashReceiptsSchema> }
  })

export const deleteCashReceipt = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('cash_register_receipts')
      .delete()
      .eq('id', input.id)

    if (error) {
      throw new Error('Erro ao remover recibo', error)
    }

    revalidatePath('/admin/cash-register')
  })

export const readCashSessionCached = cache(readCashSession)
export const readPaymentsByCashSessionIdCached = cache(
  readPaymentsByCashSessionId,
)
export const readOpenPurchasesCached = cache(readOpenPurchases)
export const readOpenTablesCached = cache(readOpenTables)
export const readCashReceiptsCached = cache(readCashReceipts)
export const readCashSessionPaymentsCached = cache(readCashSessionPayments)
