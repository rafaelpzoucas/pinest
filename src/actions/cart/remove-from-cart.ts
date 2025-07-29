'use server'

import { z } from 'zod'
import { createServerAction } from 'zsa'

export const removeFromCart = createServerAction()
  .input(
    z.object({
      sessionId: z.string(),
      productId: z.string(),
      quantity: z.number().min(1),
    }),
  )
  .handler(async ({ input }) => {
    // lógica: validar sessão, buscar produto, atualizar cart_sessions
    return { ok: true }
  })
