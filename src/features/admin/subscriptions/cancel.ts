'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidateTag } from 'next/cache'
import { createServerAction } from 'zsa'
import { deleteAdminSubscriptionInputSchema } from './schemas'

export const cancelSubscription = createServerAction()
  .input(deleteAdminSubscriptionInputSchema)
  .handler(async ({ input }) => {
    const supabase = createAdminClient()

    const { subscription_id: subscriptionId } = input

    if (!subscriptionId) return

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', plan_id: null })
      .eq('subscription_id', subscriptionId)

    if (error) {
      console.error('Error cancelling store subscription', error)
    }

    revalidateTag('subscription')
  })
