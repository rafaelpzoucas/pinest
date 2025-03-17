'use server'

import { stringToNumber } from '@/lib/utils'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { closeBillFormSchema } from './schemas'

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

    let query = supabase.from('purchase_payments').select('*')

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

export const createPayment = adminProcedure
  .createServerAction()
  .input(closeBillFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: createdPayment, error } = await supabase
      .from('purchase_payments')
      .insert({
        ...input,
        amount: stringToNumber(input.amount),
        discount: stringToNumber(input.discount),
      })
      .select()

    if (error || !createdPayment) {
      console.error('Error creating payment transaction.', error)
      return
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
  .input(closeBillFormSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    if (input.table_id) {
      const { data: createdPayment, error } = await supabase
        .from('tables')
        .delete()
        .eq('id', input.table_id)

      if (error || !createdPayment) {
        console.error('Error closing table bills.', error)
        return
      }
    }

    if (input.purchase_id) {
      const { data: createdPayment, error } = await supabase
        .from('purchase_payments')
        .update({
          is_paid: true,
        })
        .select()

      if (error || !createdPayment) {
        console.error('Error closing purchase bills.', error)
      }
    }
  })
