import { readOpenOrders } from "@/features/admin/orders/read-open";
import { readStore } from "./dashboard/actions";
import { RealtimeNotifications } from "./realtime-notifications";

export async function SoundNotification() {
  const [[ordersData], storeData] = await Promise.all([
    readOpenOrders(),
    readStore(),
  ]);

  const orders = ordersData ? ordersData.openOrders : null;
  if (!orders || !storeData) return null;

  return <RealtimeNotifications orders={orders} store={storeData.store} />;
}
