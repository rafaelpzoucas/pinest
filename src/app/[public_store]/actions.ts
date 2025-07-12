'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { cache } from 'react'

export const readStore = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    console.time('readStore')
    const { store } = ctx
    console.timeEnd('readStore')
    return { store }
  })

export const readStoreCached = cache(readStore)
