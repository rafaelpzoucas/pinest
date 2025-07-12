'use server'

import { storeProcedure } from '@/lib/zsa-procedures'
import { cache } from 'react'
import { generateRequestId, logCpu } from './utils'

export const readStore = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const requestId = generateRequestId()

    return await logCpu(`${requestId}::readStore`, async () => {
      const { store } = ctx
      return { store }
    })
  })

export const readStoreCached = cache(readStore)
