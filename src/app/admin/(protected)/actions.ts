'use server'

import { stripe } from '@/lib/stripe'
import { adminProcedure } from '@/lib/zsa-procedures'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const createPlanCheckout = adminProcedure
  .createServerAction()
  .input(z.object({ price_id: z.string(), plan_id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { store } = ctx

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: input.price_id, quantity: 1 }],
        subscription_data: {
          metadata: { store_id: store.id, plan_id: input.plan_id },
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
      })

      return { sessionURL: session.url }
    } catch (error) {
      console.error('Erro ao criar sessão de pagamento:', error)
      return { error: 'Erro interno no servidor' }
    }
  })

export const upgradeSubscription = adminProcedure
  .createServerAction()
  .input(z.object({ new_price_id: z.string(), new_plan_id: z.string() }))
  .handler(async ({ ctx, input }) => {
    const { store, supabase } = ctx

    // Recuperar a assinatura ativa do banco
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('store_id', store.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError || !subscription) {
      return { error: 'Nenhuma assinatura ativa encontrada.' }
    }

    try {
      // Buscar a assinatura na Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.subscription_id,
      )

      // Atualizar o plano da assinatura
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.subscription_id,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id, // ID do item da assinatura atual
              price: input.new_price_id, // Novo preço
            },
          ],
          proration_behavior: 'create_prorations', // Cobrar apenas a diferença
        },
      )

      // Atualizar o banco de dados com o novo plano
      const { error: updateSubscriptionError } = await supabase
        .from('subscriptions')
        .update({ plan_id: input.new_plan_id })
        .eq('store_id', store.id)

      if (updateSubscriptionError) {
        console.error(
          'Erro ao atualizar a assinatura.',
          updateSubscriptionError,
        )
      }

      revalidatePath('/')

      return { success: true, subscription: updatedSubscription }
    } catch (error) {
      console.error('Erro ao fazer upgrade de plano:', error)
      return { error: 'Erro ao atualizar assinatura' }
    }
  })
