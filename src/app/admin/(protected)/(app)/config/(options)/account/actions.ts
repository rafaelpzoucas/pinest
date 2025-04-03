'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { adminProcedure, storeProcedure } from '@/lib/zsa-procedures'
import { HourType } from '@/models/hour'
import { SocialMediaType } from '@/models/social'
import { StoreType } from '@/models/store'
import { UserType } from '@/models/user'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function readUser(): Promise<{
  data: UserType | null
  error: any | null
}> {
  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)
  }

  const { data, error } = await supabase
    .from('users')
    .select(
      `
      *,
      stores (
        * 
      )
    `,
    )
    .eq('id', session.user?.id)
    .single()
  return { data, error }
}

export async function readStoreByUserId(): Promise<{
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
        market_niches (*),
        addresses (*)
      `,
    )
    .eq('user_id', session.user?.id)
    .single()

  return { store, storeError }
}

export async function signUserOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
  }

  return redirect('/admin/sign-in')
}

export async function readStoreByStoreURL(storeURL: string) {
  const supabase = createClient()

  const { data: store, error: readStoreError } = await supabase
    .from('stores')
    .select('*')
    .eq('store_subdomain', storeURL)
    .single()

  return { store, readStoreError }
}

export const readStoreSocials = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: socials, error: readSocialsError } = await supabase
      .from('store_socials')
      .select('*')
      .eq('store_id', store?.id)

    if (readSocialsError) {
      return { socials: null, readSocialsError }
    }

    return { socials: socials as SocialMediaType[] }
  })

export const readOpeningHours = storeProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, store } = ctx

    const { data: hours, error: readHoursError } = await supabase
      .from('store_hours')
      .select('*')
      .eq('store_id', store?.id)

    if (readHoursError || !hours) {
      console.error('Erro ao buscar horários de abertura.', readHoursError)
      return
    }

    // Ordem dos dias da semana para referência
    const dayOrder = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]

    // Ordenar os horários com base na referência
    const sortedHours = hours?.sort(
      (a, b) =>
        dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week),
    )

    return { hours: sortedHours as HourType[] }
  })

export async function readStoreTheme(storeURL: string): Promise<{
  themeColor: string
  themeMode: string
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('stores')
    .select('theme_color, theme_mode')
    .eq('store_subdomain', storeURL)
    .single()

  if (error) {
    console.error('Erro ao carregar tema da loja:', error)
    return { themeColor: 'Zinc', themeMode: 'light' } // Valores padrão em caso de erro
  }

  return {
    themeColor: data.theme_color || 'Zinc',
    themeMode: data.theme_mode || 'light',
  }
}

export const readAccountData = adminProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { user, store, supabase } = ctx

    const [
      { data: userData, error: userDataError },
      { data: storeAddress, error: storeAddressError },
      { data: subscription, error: subscriptionError },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('addresses').select('*').eq('store_id', store?.id).single(),
      supabase
        .from('subscriptions')
        .select(
          `
          *,
          plans (*)
        `,
        )
        .eq('store_id', store.id)
        .eq('status', 'active')
        .single(),
    ])

    if (userDataError || subscriptionError || storeAddressError) {
      console.error('Erro ao carregar assinatura:', {
        cause: { userDataError, subscriptionError, storeAddressError },
      })
      throw new Error('Erro ao carregar assinatura')
    }

    return { userData, storeAddress, subscription }
  })

export const cancelSubscription = adminProcedure
  .createServerAction()
  .input(z.object({ subscriptionId: z.string() }))
  .handler(async ({ input }) => {
    const { subscriptionId } = input

    if (subscriptionId) {
      const canceledSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        },
      )

      if (canceledSubscription) {
        console.log('Assinatura cancelada:', canceledSubscription)
      }
    }

    revalidatePath('/')
  })
