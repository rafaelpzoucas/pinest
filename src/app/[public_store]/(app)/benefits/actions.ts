import { storeProcedure } from '@/lib/zsa-procedures'
import { BenefitType } from '@/models/benefits'

export const readBenefits = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: benefits, error } = await supabase
      .from('store_benefits')
      .select('*')
      .eq('store_id', store?.id)

    if (error) {
      console.error('Erro ao ler benefícios.', error)
    }

    return {
      benefits: benefits as BenefitType[],
    }
  })
