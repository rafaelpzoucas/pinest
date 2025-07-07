'use server'

import { stringToNumber } from '@/lib/utils'
import { adminProcedure, cashProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { closeSaleSchema, createPaymentSchema } from './schemas'

export const readPayments = adminProcedure
  .createServerAction()
  .input(
    z.object({
      table_id: z.string().optional(),
      purchase_id: z.string().optional(),
    }),
  )
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    let query = supabase.from('payments').select('*')

    if (input.table_id) {
      query = query.eq('table_id', input.table_id)
    }

    if (input.purchase_id) {
      query = query.eq('purchase_id', input.purchase_id)
    }

    const { data: payments, error } = await query

    if (error || !payments) {
      console.error('Error reading payments', error)
      return
    }

    return { payments }
  })

export const createPayment = cashProcedure
  .createServerAction()
  .input(createPaymentSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase, store, cashSession } = ctx

    const customerId = input.customer_id
    const amount = stringToNumber(input.amount)
    const discount = stringToNumber(input.discount)

    const { data: createdPayment, error } = await supabase
      .from('payments')
      .insert({
        ...input,
        amount,
        discount,
        status: input.payment_type === 'DEFERRED' ? 'pending' : input.status,
        store_id: store.id,
        cash_session_id: cashSession.id,
        description: 'Venda',
      })
      .select()

    if (error || !createdPayment) {
      console.error('Error creating payment transaction.', error)
      return
    }

    const { data: customerToUpdate, error: customerToUpdateError } =
      await supabase
        .from('store_customers')
        .select('*')
        .eq('id', customerId)
        .single()

    if (customerToUpdateError || !customerToUpdate) {
      console.error(
        'Error fetching customer for balance update.',
        customerToUpdateError,
      )
      return
    }

    if (customerId) {
      const { error: updateCustomerBalance } = await supabase
        .from('store_customers')
        .update({ balance: customerToUpdate?.balance - amount })
        .eq('id', customerId)

      if (updateCustomerBalance) {
        console.error('Error updating customer balance.', updateCustomerBalance)
        return
      }
    }

    if (input.items) {
      for (const item of input.items) {
        const { error } = await supabase
          .from('purchase_items')
          .update({ is_paid: true })
          .eq('id', item.id)

        if (error) {
          console.error('Error updating purchase item status.', error)
        }
      }
    }

    revalidatePath('/admin/purchases/close')

    return { createdPayment }
  })

export const closeBills = adminProcedure
  .createServerAction()
  .input(closeSaleSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    if (input.table_id) {
      const { data: createdPayment, error } = await supabase
        .from('tables')
        .update({ status: 'closed' })
        .eq('id', input.table_id)

      if (error || !createdPayment) {
        console.error('Error closing table bills.', error)
        return
      }
    }

    if (input.purchase_id) {
      const { data: createdPayment, error } = await supabase
        .from('purchases')
        .update({
          is_paid: true,
        })
        .eq('id', input.purchase_id)
        .select()

      if (error || !createdPayment) {
        console.error('Error closing purchase bills.', error)
      }
    }

    revalidatePath('/admin/purchases')
  })
