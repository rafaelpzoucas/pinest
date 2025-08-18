import { readStore } from './dashboard/actions'
import { readOrders } from './orders/actions'
import { RealtimeNotifications } from './realtime-notifications'

export async function SoundNotification() {
  const [{ orders }, storeData] = await Promise.all([readOrders(), readStore()])

  if (!orders || !storeData) return null

  return <RealtimeNotifications orders={orders} store={storeData.store} />
}
