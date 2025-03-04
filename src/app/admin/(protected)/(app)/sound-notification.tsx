import { readPurchases } from './purchases/actions'
import { RealtimeNotifications } from './realtime-notifications'

export async function SoundNotification() {
  const { purchases } = await readPurchases()

  if (!purchases) return null

  return <RealtimeNotifications purchases={purchases} />
}
