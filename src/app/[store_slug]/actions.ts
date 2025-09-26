import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createServerAction, ZSAError } from 'zsa'

export const getStoreTheme = createServerAction()
  .input(z.object({ subdomain: z.string() }))
  .handler(async ({ input }) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('stores')
      .select('theme_mode, theme_color')
      .eq('store_subdomain', input.subdomain)
      .single()

    if (error) {
      throw new ZSAError('INTERNAL_SERVER_ERROR', error.message)
    }

    return { themeMode: data.theme_mode, themeColor: data.theme_color }
  })
