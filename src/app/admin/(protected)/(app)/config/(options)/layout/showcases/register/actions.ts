'use server'

import { createClient } from '@/lib/supabase/server'
import { ShowcaseType } from '@/models/showcase'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readStoreByUserId } from '../../../account/actions'
import { showcaseStatusFormSchema } from '../status-form'
import { showcaseFormSchema } from './form'

export async function readShowcaseById(showcaseId: string): Promise<{
  showcase: ShowcaseType | null
  readShowcaseError: any | null
}> {
  const supabase = createClient()

  const { data: showcase, error: readShowcaseError } = await supabase
    .from('store_showcases')
    .select('*')
    .eq('id', showcaseId)
    .single()

  return { showcase, readShowcaseError }
}

export async function createShowcase(
  values: z.infer<typeof showcaseFormSchema>,
): Promise<{
  showcase: ShowcaseType[] | null
  insertShowcaseError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const { data: showcase, error: insertShowcaseError } = await supabase
    .from('store_showcases')
    .insert({ ...values, status: true, store_id: store?.id })
    .select()

  revalidatePath('/admin/config/layout')

  return { showcase, insertShowcaseError }
}

export async function updateShowcase(
  showcaseId: string,
  values: z.infer<typeof showcaseFormSchema>,
): Promise<{
  showcase: ShowcaseType[] | null
  updateShowcaseError: any | null
}> {
  const supabase = createClient()

  const { data: showcase, error: updateShowcaseError } = await supabase
    .from('store_showcases')
    .update({ ...values })
    .eq('id', showcaseId)
    .select()

  revalidatePath('/admin/config/layout')

  return { showcase, updateShowcaseError }
}

export async function deleteShowcase(showcaseId: string) {
  const supabase = createClient()

  const { data: showcase, error: updateShowcasesError } = await supabase
    .from('store_showcases')
    .delete()
    .eq('id', showcaseId)

  revalidatePath('/admin/config/layout')

  return { showcase, updateShowcasesError }
}

export async function updateShowcaseStatus(
  showcaseId: string,
  status: z.infer<typeof showcaseStatusFormSchema>,
): Promise<{
  showcase: ShowcaseType[] | null
  updateShowcaseError: any | null
}> {
  const supabase = createClient()

  const { data: showcase, error: updateShowcaseError } = await supabase
    .from('store_showcases')
    .update({ ...status })
    .eq('id', showcaseId)
    .select()

  revalidatePath('/admin/config/layout')

  return { showcase, updateShowcaseError }
}
