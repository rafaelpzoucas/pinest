'use server'

import { adminProcedure } from '@/lib/zsa-procedures'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { CouponFormValues, couponSchema } from './schema'

export const createCoupon = adminProcedure
  .createServerAction()
  .input(couponSchema)
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    // Garante código único por loja
    const { data: existing, error: findError } = await supabase
      .from('coupons')
      .select('id')
      .eq('store_id', store.id)
      .eq('code', input.code)
      .maybeSingle()

    if (findError) throw new Error('Erro ao verificar código do cupom')
    if (existing)
      throw new Error('Já existe um cupom com esse código nesta loja')

    const { error } = await supabase.from('coupons').insert({
      ...input,
      store_id: store.id,
      usage_count: 0,
      discount: input.discount,
      created_at: new Date().toISOString(),
    })

    if (error) throw new Error('Erro ao criar cupom: ' + error.message)

    return redirect('/admin/promotions')
  })

export const readCoupons = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { store, supabase } = ctx
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Erro ao buscar cupons', error)
    }
    return { coupons: coupons as CouponFormValues[] }
  })

export const readCouponById = adminProcedure
  .createServerAction()
  .input(z.object({ couponId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('store_id', store.id)
      .eq('id', input.couponId)
      .single()

    if (error) {
      throw new Error('Erro ao buscar cupom pelo id', error)
    }

    return { coupon: coupon as CouponFormValues }
  })

export const updateCoupon = adminProcedure
  .createServerAction()
  .input(couponSchema)
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('coupons')
      .update(input)
      .eq('id', input.id)

    if (error) throw new Error('Erro ao atualizar cupom', error)
  })

export const deleteCoupon = adminProcedure
  .createServerAction()
  .input(z.object({ couponId: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { supabase } = ctx

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', input.couponId)

    if (error) {
      throw new Error('Erro ao deletar cupom', error)
    }
  })
