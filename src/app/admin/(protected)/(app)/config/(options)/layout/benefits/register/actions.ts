'use server'

import { createClient } from '@/lib/supabase/server'
import { BenefitType } from '@/models/benefits'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readStoreByUserId } from '../../../account/actions'
import { benefitFormSchema } from './form'

export async function readBenefitById(benefitId: string): Promise<{
  benefit: BenefitType | null
  readBenefitError: any | null
}> {
  const supabase = createClient()

  const { data: benefit, error: readBenefitError } = await supabase
    .from('store_benefits')
    .select('*')
    .eq('id', benefitId)
    .single()

  return { benefit, readBenefitError }
}

export async function createBenefit(
  values: z.infer<typeof benefitFormSchema>,
): Promise<{
  benefit: BenefitType[] | null
  insertBenefitsError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const { data: benefit, error: insertBenefitsError } = await supabase
    .from('store_benefits')
    .insert({ ...values, store_id: store?.id })
    .select()

  revalidatePath('/admin/config/layout')

  return { benefit, insertBenefitsError }
}

export async function updateBenefit(
  benefitId: string,
  values: z.infer<typeof benefitFormSchema>,
): Promise<{
  benefit: BenefitType[] | null
  updateBenefitsError: any | null
}> {
  const supabase = createClient()

  const { data: benefit, error: updateBenefitsError } = await supabase
    .from('store_benefits')
    .update({ ...values })
    .eq('id', benefitId)
    .select()

  revalidatePath('/admin/config/layout')

  return { benefit, updateBenefitsError }
}

export async function deleteBenefit(benefitId: string) {
  const supabase = createClient()

  const { data: benefit, error: updateBenefitsError } = await supabase
    .from('store_benefits')
    .delete()
    .eq('id', benefitId)

  revalidatePath('/admin/config/layout')

  return { benefit, updateBenefitsError }
}
