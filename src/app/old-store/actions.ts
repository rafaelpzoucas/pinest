'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { cache } from 'react'

export const readStore = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store } = ctx
    return { store }
  })

export const readStoreCached = cache(readStore)
