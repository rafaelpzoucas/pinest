export type AppliedCouponType = NonNullable<
  | {
      valid: boolean
      error: string
      discount?: undefined
      discount_type?: undefined
      coupon_id?: undefined
      code?: string
    }
  | {
      valid: boolean
      discount: any
      discount_type: any
      coupon_id: any
      error?: undefined
      code?: string
    }
  | null
>

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
