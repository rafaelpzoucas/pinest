import { AppliedCouponType } from '@/models/coupon'
import { create } from 'zustand'

type CouponState = {
  appliedCoupon: AppliedCouponType | null
  setAppliedCoupon: (state: AppliedCouponType | null) => void
}

export const useCouponStore = create<CouponState>((set) => ({
  appliedCoupon: null,
  setAppliedCoupon: (state) => set({ appliedCoupon: state }),
}))
