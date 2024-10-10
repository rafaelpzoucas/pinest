'use server'

import { createClient } from '@/lib/supabase/server'
import { ShowcaseType } from '@/models/showcase'
import { readStoreByUserId } from '../../account/actions'

export async function readShowcases(): Promise<{
  showcases: ShowcaseType[] | null
  readShowcasesError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const { data: showcases, error: readShowcasesError } = await supabase
    .from('store_showcases')
    .select('*')
    .eq('store_id', store?.id)
    .order('position', { ascending: true })

  return { showcases, readShowcasesError }
}

export async function updateShowcasesPositions(
  newOrder: { id: string; order: number }[],
) {
  const supabase = createClient()

  for (const showcase of newOrder) {
    const { error } = await supabase
      .from('store_showcases')
      .update({ position: showcase.order })
      .eq('id', showcase.id)

    if (error) {
      console.error(error)
    }
  }
}
