'use server'

import { stringToNumber } from '@/lib/utils'
import { adminProcedure, cashProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  closeCashSessionSchema,
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
        user_id: user.id,
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
        closing_balance_cash: stringToNumber(input.closing_balance_cash),
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
      .eq('user_id', user.id)
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
      .neq('status', 'delivered')
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
