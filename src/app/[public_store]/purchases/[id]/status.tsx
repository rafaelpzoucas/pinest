import { CustomerType } from '@/models/customer'
import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { RealtimeStatus } from './realtime-status'

export type StatusKey = keyof typeof statuses

export function Status({
  purchase,
  customer,
}: {
  purchase: PurchaseType
  customer?: CustomerType
}) {
  return <RealtimeStatus purchase={purchase} customerPhone={customer?.phone} />
}
