'use server'

import { createClient } from '@/lib/supabase/server'
import { ExtraType } from '@/models/extras'
import { revalidatePath } from 'next/cache'

export async function readExtrasByStore(storeId?: string): Promise<{
  data: ExtraType[] | null
  error: any | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('extras')
    .select(
      `
        *
      `,
    )
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function deleteExtra(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('extras').delete().eq('id', id)

  revalidatePath('/catalog')

  return { error }
}
