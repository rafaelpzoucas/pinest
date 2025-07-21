import { createClient } from '@/lib/supabase/client'
import { BenefitType } from '@/models/benefits'

export async function readBenefitsData(storeId?: string) {
  const supabase = createClient()

  const { data: benefits, error } = await supabase
    .from('store_benefits')
    .select('*')
    .eq('store_id', storeId)

  if (error) {
    console.error('Erro ao ler benefícios.', error)
  }

  return {
    benefits: benefits as BenefitType[],
  }
}
