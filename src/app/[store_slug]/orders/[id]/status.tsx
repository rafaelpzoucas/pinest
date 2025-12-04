import type { Order } from "@/features/_global/orders/schemas";
import type { Customer } from "@/features/store/customers/schemas";
import type { statuses } from "@/models/statuses";
import { RealtimeStatus } from "./realtime-status";

export type StatusKey = keyof typeof statuses;

export function OrderStatus({
  order,
  customer,
}: {
  order: Order;
  customer?: Customer;
}) {
  return <RealtimeStatus order={order} customerPhone={customer?.phone} />;
}
