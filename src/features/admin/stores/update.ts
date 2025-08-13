'use server'

import { setStoreEdgeConfigVercel } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/store/actions'
import { generateSlug } from '@/lib/utils'
import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { updateAdminStoreSchema } from './schemas'

export const updateAdminStore = authenticatedProcedure
  .createServerAction()
  .input(updateAdminStoreSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const newColumns = {
      ...input,
      name: input?.name?.trim(),
      store_subdomain: generateSlug(input?.name?.trim() as string),
    }

    const { data, error } = await supabase
      .from('stores')
      .update(newColumns)
      .eq('id', input?.id)

    setStoreEdgeConfigVercel({
      name: newColumns.name,
      description: newColumns?.description ?? undefined,
      subdomain: newColumns.store_subdomain,
      logoUrl: newColumns.store_subdomain,
    })

    return { data, error }
  })
