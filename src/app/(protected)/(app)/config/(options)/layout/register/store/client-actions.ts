'use client'

import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { setStoreEdgeConfigVercel } from './actions'
import { FileType } from './logo-uploader'

export async function uploadLogo(
  files: FileType[],
  storeId: string,
): Promise<{
  uploadError: any | null
  updateError: any | null
}> {
  const supabase = createClient()

  const bucket = 'logos'
  const directory = 'business-logos'

  const { data: uploaded, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(`${directory}/${uuidv4()}`, files[0], {
      cacheControl: '3600',
      upsert: false,
    })

  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${uploaded?.path}`

  // Atualiza logo na tabela
  const { data: updated, error: updateError } = await supabase
    .from('stores')
    .update({
      logo_url: logoUrl,
    })
    .eq('id', storeId)
    .select('store_subdomain') // 👈 necessário para o Edge Config

  const subdomain = updated?.[0]?.store_subdomain

  if (subdomain) {
    await setStoreEdgeConfigVercel({
      subdomain,
      logoUrl,
    })
  } else {
    console.warn('Store subdomain não encontrado')
  }

  return { updateError, uploadError }
}
