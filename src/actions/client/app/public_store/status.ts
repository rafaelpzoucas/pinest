import { createClient } from '@/lib/supabase/client'

export async function storeShouldBeOpen(
  shouldBeOpen: boolean,
  storeId?: string,
) {
  const supabase = createClient()
  const { error: updateError } = await supabase
    .from('stores')
    .update({ is_open: shouldBeOpen })
    .eq('id', storeId)

  if (updateError) {
    throw new Error('Erro ao atualizar status da loja:', updateError)
  }
}
