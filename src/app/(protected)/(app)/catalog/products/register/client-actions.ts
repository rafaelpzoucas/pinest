'use client'

import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { FileType } from './form/file-uploader'

export async function readProductImages(productId: string): Promise<{
  productImages: any | null
  productImagesError: any | null
}> {
  const supabase = createClient()

  const { data: productImages, error: productImagesError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)

  return { productImages, productImagesError }
}

export async function uploadImages(
  files: FileType[],
  productId: string,
): Promise<{
  uploadErrors: any[] | null
  insertErrors: any[] | null
}> {
  const supabase = createClient()

  const bucket = 'products-images'
  const directory = 'products'
  const uploadErrors: any[] = []
  const insertErrors: any[] = []

  for (const file of files) {
    const { data: uploaded, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(`${directory}/${uuidv4()}`, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      uploadErrors.push(uploadError)
      continue
    }

    const imageId = uploaded.path.split('/')[1]

    const { error: insertError } = await supabase
      .from('product_images')
      .insert([
        {
          image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${uploaded.path}`,
          product_id: productId,
          id: imageId,
        },
      ])
      .select()

    if (insertError) {
      insertErrors.push(insertError)
    }
  }

  return {
    uploadErrors: uploadErrors.length > 0 ? uploadErrors : null,
    insertErrors: insertErrors.length > 0 ? insertErrors : null,
  }
}
