'use server'

import { stripe } from '@/lib/stripe'
import { authenticatedProcedure } from '@/lib/zsa-procedures'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type Stripe from 'stripe'
import { ZSAError } from 'zsa'

export const createAdminSubscriptionCheckout = authenticatedProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { supabase, user } = ctx

    if (!user) {
      redirect('/admin/sign-in')
    }

    const cookieStore = cookies()

    const priceId = cookieStore.get('price_id')?.value ?? ''
    const planId = cookieStore.get('plan_id')?.value ?? ''

    if (!priceId || !planId) {
      throw new ZSAError(
        'INPUT_PARSE_ERROR',
        'price_id or plan_id are undefined',
      )
    }

    // Refatorado: busca role e dados da loja em uma só query
    const { data: store, error } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (error) {
      throw new Error('User is not an admin or does not have a store')
    }

    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card', 'boleto'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            store_id: store.id,
            plan_id: planId,
          },
          trial_period_days: 14, // 14 days trial
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
      }

      const session = await stripe.checkout.sessions.create(sessionParams)

      if (!session.url) {
        throw new Error('Failed to create checkout session URL')
      }

      return session.url
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error)
      throw error
    }
  })
