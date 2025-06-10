import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerAction } from 'zsa'
import {
  createHandshakeEvent,
  deleteHandshakeEvent,
  handleCancelOrder,
  handleOrderNewStatus,
  handleOrderPlaced,
  keepAlive,
} from './actions'

import { createRouteHandlersForAction } from 'zsa-openapi'
import IfoodHandshakeDisputeSchema from './schemas'

const webhookSchema = z.object({
  code: z.string(),
  orderId: z.string().optional(),
})

const webhookAction = createServerAction()
  .input(webhookSchema)
  .handler(async ({ request }) => {
    try {
      const body = await request?.json()

      console.log('[IFOOD EVENT]: ', body)

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

        case 'HSD': {
          try {
            const validated = IfoodHandshakeDisputeSchema.parse(body)
            await createHandshakeEvent(validated)
          } catch (err) {
            console.error('Erro ao validar schema do HSD:', err)
          }
          break
        }
        case 'CARF': {
          console.log('Cancellation request failed.', body)
          await deleteHandshakeEvent({ order_id: body.orderId })
          break
        }

        case 'HANDSHAKE_SETTLEMENT': {
          console.log('✅ Acordo detectado!', body)
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
