import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'

export const getNextDisplayId = createServerAction()
  .input(z.object({ storeId: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_next_display_id', {
      input_store_id: input.storeId,
    })

    if (error || !data) {
      throw new Error('Erro ao gerar display_id')
    }

    return data // current_sequence retornado
  })
