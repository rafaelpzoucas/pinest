import { PurchaseType } from '@/models/purchase'
import { statuses } from '@/models/statuses'
import { RealtimeStatus } from './realtime-status'

export type StatusKey = keyof typeof statuses

export function Status({ purchase }: { purchase: PurchaseType }) {
  return <RealtimeStatus purchase={purchase} />
}
