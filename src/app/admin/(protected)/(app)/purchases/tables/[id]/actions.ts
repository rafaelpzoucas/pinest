'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'

export const readTableById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string().optional() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: table, error: readTableError } = await supabase
      .from('tables')
      .select(
        `
          *,
          purchase_items (
            *,
            products (*)
          )
        `,
      )
      .eq('id', input.id)
      .single()

    if (readTableError || !table) {
      console.error('Error reading table', readTableError)
      return
    }

    return { table }
  })

export const readTableByIdCached = cache(readTableById)

export const updateTablePrintedItems = adminProcedure
  .createServerAction()
  .input(z.object({ tableId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    // Update em lote: marca todos os itens da mesa como impressos de uma vez
    const { error } = await supabase
      .from('purchase_items')
      .update({ printed: true })
      .eq('table_id', input.tableId)

    if (error) {
      console.error('Error updating printed status of purchase items.', error)
      return
    }

    revalidatePath('/')
  })
