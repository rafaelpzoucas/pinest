import {
  registerPushNotifications,
  registerPushNotificationsType,
} from '@/utils/registerPushNotifications'
import { useEffect } from 'react'

export function useStoreNotifications(values: registerPushNotificationsType) {
  useEffect(() => {
    if (!values.storeId && !values.customerPhone) return

    registerPushNotifications(values)
  }, [values])
}
