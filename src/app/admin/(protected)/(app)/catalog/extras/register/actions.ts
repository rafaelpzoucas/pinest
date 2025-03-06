'use server'

import { createClient } from '@/lib/supabase/server'
import { ExtraType } from '@/models/extras'

export async function readExtraById(extraId: string): Promise<{
  extra: ExtraType | null
  extraError: any | null
}> {
  const supabase = createClient()

  const { data: extra, error: extraError } = await supabase
    .from('extras')
    .select(
      `
        *
      `,
    )
    .eq('id', extraId)
    .single()

  return { extra, extraError }
}
