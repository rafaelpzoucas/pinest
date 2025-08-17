'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerAction } from 'zsa'
import { readStoreIdBySlug } from '../store/read'
import { ValidateCouponSchema } from './schemas'

export const validateStoreCoupon = createServerAction()
  .input(ValidateCouponSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()
    const code = input.code.toUpperCase()

    const [storeData] = await readStoreIdBySlug({ storeSlug: input.storeSlug })

    const storeId = storeData?.storeId

    // Busca cupom
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', storeId)
      .eq('code', code)
      .maybeSingle()

    if (error || !coupon) {
      return { valid: false, error: 'Cupom não encontrado.' }
    }

    // Status
    if (coupon.status !== 'active') {
      return { valid: false, error: 'Cupom inativo ou expirado.' }
    }

    // Expiração
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: 'Cupom expirado.' }
    }

    // Limite total
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, error: 'Limite de uso do cupom atingido.' }
    }

    // Limite por cliente
    if (input.customer_id && coupon.usage_limit_per_customer) {
      const { count, error: usageError } = await supabase
        .from('coupon_usages')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('customer_id', input.customer_id)

      if (usageError) {
        return { valid: false, error: 'Erro ao validar uso do cupom.' }
      }
      if ((count ?? 0) >= coupon.usage_limit_per_customer) {
        return { valid: false, error: 'Limite de uso por cliente atingido.' }
      }
    }

    return {
      valid: true,
      discount: coupon.discount,
      discount_type: coupon.discount_type,
      coupon_id: coupon.id,
      code: coupon.code,
    }
  })
