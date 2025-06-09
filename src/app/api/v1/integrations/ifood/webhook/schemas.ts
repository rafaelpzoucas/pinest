import { z } from 'zod'

export const createIfoodPurchaseSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  status: z.string(),
  type: z.string(),
  payment_type: z.string(),
  total: z.object({
    subtotal: z.number(),
    shipping_price: z.number(),
    discount: z.number(),
    change_value: z.number(),
    total_amount: z.number(),
  }),
  delivery: z.object({
    time: z.string().optional(),
    address: z.string(),
  }),
  is_paid: z.boolean(),
  is_ifood: z.boolean(),
  ifood_order_data: z.any(),
})

const AmountSchema = z.object({
  value: z.string(),
  currency: z.string(),
})

const EvidenceSchema = z.object({
  url: z.string().url(),
  contentType: z.string(),
})

const ItemSchema = z.object({
  id: z.string().uuid(),
  uniqueId: z.string().uuid(),
  externalCode: z.string(),
  index: z.number(),
  quantity: z.number(),
  amount: AmountSchema,
  reason: z.string(),
})

const GarnishItemSchema = z.object({
  id: z.string().uuid(),
  parentUniqueId: z.string().uuid(),
  externalCode: z.string(),
  quantity: z.number(),
  index: z.number(),
  amount: AmountSchema,
  reason: z.string(),
})

const AlternativeSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  metadata: z
    .union([
      z.object({ maxAmount: AmountSchema }).partial(),
      z
        .object({
          allowedsAdditionalTimeInMinutes: z.array(z.number()).optional(),
          allowedsAdditionalTimeReasons: z.array(z.string()).optional(),
        })
        .partial(),
    ])
    .optional(),
})

const MetadataSchema = z.object({
  disputeId: z.string().uuid(),
  action: z.string(),
  timeoutAction: z.string(),
  handshakeType: z.string(),
  handshakeGroup: z.string(),
  message: z.string(),
  expiresAt: z.string().datetime(),
  alternatives: z.array(AlternativeSchema).optional(),
  metadata: z
    .object({
      acceptCancellationReasons: z.array(z.string()).optional(),
      evidences: z.array(EvidenceSchema).optional(),
      items: z.array(ItemSchema).optional(),
      garnishItems: z.array(GarnishItemSchema).optional(),
    })
    .optional(),
  createdAt: z.string().datetime(),
})

const IfoodHandshakeDisputeSchema = z.object({
  code: z.string(),
  createdAt: z.string().datetime(),
  fullCode: z.string(),
  id: z.string().uuid(),
  merchantId: z.string().uuid(),
  metadata: MetadataSchema,
  orderId: z.string().uuid(),
  receivedAt: z.string().datetime().optional(),
})

export default IfoodHandshakeDisputeSchema
