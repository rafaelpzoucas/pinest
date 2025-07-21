export type AppliedCouponType = {
  valid: boolean
  discount: number
  discount_type: 'percent' | 'fixed'
  code: string
  coupon_id: string
}

export type CouponType = {
  id: string
  store_id: string
  created_at: string
  name: string
  code: string
  discount: number
  discount_type: 'percent' | 'fixed'
  status: 'active' | 'inactive' | 'used' | 'expired'
  expires_at: string
  usage_limit: number
  use_limit_per_customer: number
  usage_count: number
}
