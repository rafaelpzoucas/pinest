'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
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
