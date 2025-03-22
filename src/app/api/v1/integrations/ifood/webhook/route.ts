import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import {
  handleCancelOrder,
  handleOrderNewStatus,
  handleOrderPlaced,
  keepAlive,
} from './actions'

import { createRouteHandlersForAction } from 'zsa-openapi'

const webhookSchema = z.object({
  code: z.string(),
  orderId: z.string().optional(),
})

const webhookAction = createServerAction()
  .input(webhookSchema)
  .handler(async ({ request }) => {
    try {
      const body = await request?.json()

      console.log('Recebido webhook do iFood:', body)

      switch (body.code) {
        case 'PLC': {
          await handleOrderPlaced({
            orderId: body.orderId,
            merchantId: body.merchantId,
          })

          break
        }

        case 'CFM': {
          await handleOrderNewStatus({
            orderId: body.orderId,
            newStatus: 'pending',
          })

          break
        }

        case 'RTP': {
          await handleOrderNewStatus({
            orderId: body.orderId,
            newStatus: 'readyToPickup',
          })

          break
        }

        case 'DSP': {
          await handleOrderNewStatus({
            orderId: body.orderId,
            newStatus: 'shipped',
          })

          break
        }

        case 'CON': {
          await handleOrderNewStatus({
            orderId: body.orderId,
            newStatus: 'delivered',
          })

          break
        }

        case 'CAN': {
          await handleCancelOrder({
            orderId: body.orderId,
            merchantId: body.merchantId,
          })

          break
        }

        case 'KEEPALIVE':
          await keepAlive()
          break
      }

      return NextResponse.json({ message: 'Evento não processado' })
    } catch (error) {
      console.error('Erro no webhook:', error)
      return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
    }
  })

export const { POST } = createRouteHandlersForAction(webhookAction)
