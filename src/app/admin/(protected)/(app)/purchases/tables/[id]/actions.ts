'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const readTableById = adminProcedure
  .createServerAction()
  .input(z.object({ id: z.string() }))
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

export const updateTablePrintedItems = adminProcedure
  .createServerAction()
  .input(z.object({ tableId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { data: tableItems, error: tableItemsError } = await supabase
      .from('purchase_items')
      .select('*')
      .eq('table_id', input.tableId)

    if (tableItemsError || !tableItems) {
      console.error('Error reading purchase items', tableItemsError)
      return
    }

    for (const item of tableItems) {
      const { error } = await supabase
        .from('purchase_items')
        .update({ printed: true })
        .eq('id', item.id)

      if (error) {
        console.error('Error updating printed status of purchase item.', error)
      }
    }

    revalidatePath('/')
  })
