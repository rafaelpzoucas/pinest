import { CustomerType } from '@/models/customer'
import { OrderType } from '@/models/order'
import { statuses } from '@/models/statuses'
import { RealtimeStatus } from './realtime-status'

export type StatusKey = keyof typeof statuses

export function Status({
  order,
  customer,
}: {
  order: OrderType
  customer?: CustomerType
}) {
  return <RealtimeStatus order={order} customerPhone={customer?.phone} />
}
