import { createClient } from '@/lib/supabase/server'
import { BenefitType } from '@/models/benefits'
import { readStoreByUserId } from '../account/actions'

export async function readBenefits(): Promise<{
  benefits: BenefitType[] | null
  readBenefitsError: any | null
}> {
  const supabase = createClient()

  const { store, storeError } = await readStoreByUserId()

  if (storeError) {
    console.error(storeError)
  }

  const { data: benefits, error: readBenefitsError } = await supabase
    .from('store_benefits')
    .select('*')
    .eq('store_id', store?.id)

  return { benefits, readBenefitsError }
}
