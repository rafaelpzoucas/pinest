'use server'

import { createClient } from '@/lib/supabase/server'
import { adminProcedure } from '@/lib/zsa-procedures'
import { OrderType } from '@/models/order'
import { StoreType } from '@/models/store'
import { StoreCustomerType } from '@/models/store-customer'
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { cache } from 'react'

export async function getTotalOrdersOfToday(): Promise<{
  orders: OrderType[] | null
  ordersError: any | null
  ordersCount: number | null
}> {
  const supabase = createClient()

  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()

  const {
    data: orders,
    error: ordersError,
    count: ordersCount,
  } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (*)
    `,
      { count: 'exact' },
    )
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd)

  return { orders, ordersCount, ordersError }
}

export async function getMonthlyOrdersComparison(): Promise<{
  currentMonthOrders: OrderType[] | null
  previousMonthOrders: OrderType[] | null
  error: any | null
}> {
  const supabase = createClient()

  // Datas para o mês atual
  const currentMonthStart = startOfMonth(new Date()).toISOString()
  const currentMonthEnd = endOfMonth(new Date()).toISOString()

  // Datas para o mês anterior
  const previousMonthStart = startOfMonth(
    subMonths(new Date(), 1),
  ).toISOString()
  const previousMonthEnd = endOfMonth(subMonths(new Date(), 1)).toISOString()

  try {
    // Busca as compras do mês atual
    const currentMonth = await supabase
      .from('orders')
      .select(
        `
          *,
          order_items (*)
        `,
      )
      .gte('created_at', currentMonthStart)
      .lte('created_at', currentMonthEnd)

    // Busca as compras do mês anterior
    const previousMonth = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (*)
      `,
      )
      .gte('created_at', previousMonthStart)
      .lte('created_at', previousMonthEnd)

    return {
      currentMonthOrders: currentMonth.data,
      previousMonthOrders: previousMonth.data,
      error: null,
    }
  } catch (error) {
    return {
      currentMonthOrders: null,
      previousMonthOrders: null,
      error,
    }
  }
}

export async function readStore(): Promise<{
  store: StoreType | null
  storeError: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select(
      `
      *,
      addresses (
        *
      )
    `,
    )
    .eq('user_id', session.user?.id)
    .single()
  return { store, storeError }
}

export const readPendingBalances = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: storeCustomers, error } = await supabase
      .from('store_customers')
      .select(
        `
          *,
          customers (*)
        `,
      )
      .lt('balance', 0)
      .eq('store_id', store?.id)

    if (error) {
      console.error('Error reading pending balances', error)
      return
    }

    return { storeCustomers: storeCustomers as StoreCustomerType[] }
  })

export const readPendingBalancesCached = cache(readPendingBalances)
