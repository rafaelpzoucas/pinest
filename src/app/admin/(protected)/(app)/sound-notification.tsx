import { readStore } from './dashboard/actions'
import { readPurchases } from './purchases/actions'
import { RealtimeNotifications } from './realtime-notifications'

export async function SoundNotification() {
  const [{ purchases }, storeData] = await Promise.all([
    readPurchases(),
    readStore(),
  ])

  if (!purchases || !storeData) return null

  return <RealtimeNotifications purchases={purchases} store={storeData.store} />
}
