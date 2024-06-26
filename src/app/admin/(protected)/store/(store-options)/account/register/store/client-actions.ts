'use client'

import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
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

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      logo_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${uploaded?.path}`,
    })
    .eq('id', storeId)

  return { updateError, uploadError }
}
