import { createClient } from '@/lib/supabase/server'
import { BenefitType } from '@/models/benefits'

async function readStoreByURL(storeURL: string) {
  const supabase = createClient()

  const { data: store, error: readStoreError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_url', storeURL)
    .single()

  return { store, readStoreError }
}

export async function readBenefitsByStoreId(storeId: string): Promise<{
  benefits: BenefitType[] | null
  readBenefitsError: any | null
}> {
  const supabase = createClient()

  const { store, readStoreError } = await readStoreByURL(storeId)

  if (readStoreError) {
    console.error(readStoreError)
  }

  const { data: benefits, error: readBenefitsError } = await supabase
    .from('store_benefits')
    .select('*')
    .eq('store_id', store?.id)

  return { benefits, readBenefitsError }
}
