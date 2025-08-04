'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { StoreType } from '@/models/store'
import { cache } from 'react'

export const readStoreData = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store } = ctx

    return { store: store as StoreType }
  })

export const readStoreDataCached = cache(readStoreData)
