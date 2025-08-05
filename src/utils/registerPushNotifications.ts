import { z } from 'zod'

// utils/notifications.ts
const registerPushNotificationsSchema = z.object({
  storeId: z.string().optional(),
  customerPhone: z.string().optional(),
})

export type registerPushNotificationsType = z.infer<
  typeof registerPushNotificationsSchema
>

export async function registerPushNotifications({
  storeId,
  customerPhone,
}: registerPushNotificationsType) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  await navigator.serviceWorker.register('/sw.js')
  const readyRegistration = await navigator.serviceWorker.ready

  const existingSub = await readyRegistration.pushManager.getSubscription()
  const subscription =
    existingSub ??
    (await readyRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
      ),
    }))

  // Salva no banco mesmo que já exista — mas verifica se já está salvo no backend
  await fetch('/api/v1/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      subscription,
      storeId,
      customerPhone,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return new Uint8Array([...raw].map((char) => char.charCodeAt(0)))
}
