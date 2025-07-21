import { createClient } from '@/lib/supabase/client'
import { SocialMediaType } from '@/models/social'

export async function readSocialsData(storeId?: string) {
  const supabase = createClient()

  const { data: socials, error: readSocialsError } = await supabase
    .from('store_socials')
    .select('*')
    .eq('store_id', storeId)

  if (readSocialsError) {
    return { socials: null, readSocialsError }
  }

  return { socials: socials as SocialMediaType[] }
}
