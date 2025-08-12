'use server'

import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { revalidateTag } from 'next/cache'
import { ZSAError } from 'zsa'

export const deleteAdminStoreLogo = authenticatedProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, user } = ctx

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, logo_url')
      .eq('user_id', user?.id)
      .single()

    if (storeError) {
      console.error('[deleteAdminStoreLogo] Error fetching store:', storeError)
      throw new ZSAError('INTERNAL_SERVER_ERROR', 'Failed to fetch store data.')
    }

    if (!store) {
      console.error(
        '[deleteAdminStoreLogo] Store not found for user:',
        user?.id,
      )
      throw new ZSAError('NOT_FOUND', 'Store not found for current user.')
    }

    const { data, error } = await supabase
      .from('stores')
      .update({ logo_url: null })
      .eq('id', store?.id)

    if (error) {
      console.error('[deleteAdminStoreLogo] Error updating logo_url:', error)
      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to update store logo_url.',
      )
    }

    if (!store.logo_url) {
      console.warn('[deleteAdminStoreLogo] No logo_url to remove from storage.')
    } else {
      // Remove arquivo da storage
      const bucket = 'logos'
      const filePath = store.logo_url.split(`/public/${bucket}/`)[1]

      if (!filePath) {
        console.warn(
          '[deleteAdminStoreLogo] Invalid logo_url format:',
          store.logo_url,
        )
      } else {
        const { error: removeLogoError } = await supabase.storage
          .from(bucket)
          .remove([filePath])

        if (removeLogoError) {
          console.error(
            '[deleteAdminStoreLogo] Error removing logo file:',
            removeLogoError,
          )

          throw new ZSAError(
            'INTERNAL_SERVER_ERROR',
            'Failed to remove logo file from storage.',
          )
        }
      }
    }

    revalidateTag('admin-logo')

    return { data, error }
  })
