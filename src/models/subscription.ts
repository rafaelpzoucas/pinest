import { PlanType } from './plans'

export type SubscriptionType = {
  id: string
  created_at: string
  store_id: string
  subscription_id: string
  plan_id: string
  status: string
  start_date: string
  end_date: null
  plans: PlanType
}
