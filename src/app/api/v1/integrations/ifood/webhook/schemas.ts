import { z } from 'zod'

export const createIfoodPurchaseSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  status: z.string(),
  total_amount: z.number(),
  shipping_price: z.number(),
  type: z.string(),
  accepted: z.boolean(),
  change_value: z.number(),
  payment_type: z.string(),
  guest_data: z.any(),
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
  metadata: z.union([
    z.object({ maxAmount: AmountSchema }),
    z.object({
      allowedsAdditionalTimeInMinutes: z.array(z.number()),
      allowedsAdditionalTimeReasons: z.array(z.string()),
    }),
  ]),
})

const MetadataSchema = z.object({
  disputeId: z.string().uuid(),
  action: z.string(),
  timeoutAction: z.string(),
  handshakeType: z.string(),
  handshakeGroup: z.string(),
  message: z.string(),
  expiresAt: z.string().datetime(),
  alternatives: z.array(AlternativeSchema),
  metadata: z.object({
    acceptCancellationReasons: z.array(z.string()),
    evidences: z.array(EvidenceSchema),
    items: z.array(ItemSchema),
    garnishItems: z.array(GarnishItemSchema),
  }),
  createdAt: z.string().datetime(),
})

const IfoodHandshakeDisputeSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  code: z.string(),
  fullcode: z.string(),
  merchantId: z.string().uuid(),
  createdAt: z.string().datetime(),
  metadata: MetadataSchema,
  receivedAt: z.string().datetime(),
})

export default IfoodHandshakeDisputeSchema
