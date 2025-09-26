import { Order } from '@/features/_global/orders/schemas'
import { Customer } from '@/features/store/customers/schemas'
import { statuses } from '@/models/statuses'
import { RealtimeStatus } from './realtime-status'

export type StatusKey = keyof typeof statuses

export function Status({
  order,
  customer,
}: {
  order: Order
  customer?: Customer
}) {
  return <RealtimeStatus order={order} customerPhone={customer?.phone} />
}
