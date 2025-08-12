'use server'

import { createServerAction, ZSAError } from 'zsa'
import { readViaCepAddressSchema } from '../schemas'
import { ViacepResponse } from './schemas'

export const readViaCepAddress = createServerAction()
  .input(readViaCepAddressSchema)
  .handler(async ({ input }) => {
    const res = await fetch(`https://viacep.com.br/ws/${input.zipCode}/json`)

    if (!res.ok) {
      throw new ZSAError('NOT_FOUND', 'Address not found')
    }

    const data = await res.json()

    return { viacepAddress: data as ViacepResponse }
  })
