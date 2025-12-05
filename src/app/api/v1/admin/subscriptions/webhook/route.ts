"use server";

import { cancelSubscription } from "@/features/admin/subscriptions/cancel";
import { createAdminSubscription } from "@/features/admin/subscriptions/create";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { z } from "zod";
import { createServerAction } from "zsa";
import { createRouteHandlersForAction } from "zsa-openapi";

const webhookLogger = createServerAction()
  .input(z.object({ payload: z.unknown() }))
  .handler(async ({ request }) => {
    // A chave secreta do seu webhook do Stripe
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

    const body = (await request?.text()) as string;
    const sig = request?.headers.get("Stripe-Signature") || "";

    let event: Stripe.Event;

    try {
      // Usa constructEventAsync para a verificação assíncrona
      event = await stripe.webhooks.constructEventAsync(
        body,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return { status: "signature verification failed" };
    }

    const eventObject = event.data.object;

    switch (event.type) {
      // Pagamento bem-sucedido da fatura
      case "invoice.payment_succeeded": {
        if (isInvoice(eventObject)) {
          const subscriptionId =
            typeof eventObject.subscription === "string"
              ? eventObject.subscription
              : null;
          if (!subscriptionId) {
            console.error("Invoice recebida sem subscription ID.");
            break;
          }

          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          if (isSubscription(subscription)) {
            const metadata = subscription.metadata;
            await createAdminSubscription({
              subscription_id: subscription.id,
              plan_id: metadata.plan_id,
              store_id: metadata.store_id,
              end_date: subscription.current_period_end,
            });
          } else {
            console.error("Assinatura recuperada não é válida.");
          }
        } else {
          console.error("Objeto do evento não é uma invoice válida.");
        }
        break;
      }

      // Cancelamento da assinatura
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;
        console.log("Subscription canceled:", subscription);
        // Lógica para quando o cliente cancelar a assinatura
        cancelSubscription({
          subscription_id: subscription.id,
          store_id: metadata.store_id,
        });
        break;
      }

      // Falha no pagamento da fatura (problema de pagamento)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const metadata = invoice.metadata;
        console.log("Payment failed for invoice:", invoice);
        // Lógica para quando o pagamento da fatura falhar
        cancelSubscription({
          subscription_id: invoice.id,
          store_id: metadata?.store_id as string,
        });
        break;
      }

      // Se houver outros eventos que você deseja tratar, adicione mais cases
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { status: "ok" };
  });

function isInvoice(obj: unknown): obj is Stripe.Invoice {
  if (typeof obj === "object" && obj !== null) {
    const candidate = obj as Record<string, unknown>;
    return candidate.object === "invoice";
  }
  return false;
}

function isSubscription(obj: unknown): obj is Stripe.Subscription {
  if (typeof obj === "object" && obj !== null) {
    const candidate = obj as Record<string, unknown>;
    return candidate.object === "subscription";
  }
  return false;
}

function isRefund(obj: unknown): obj is Stripe.Refund {
  if (typeof obj === "object" && obj !== null) {
    const candidate = obj as Record<string, unknown>;
    return candidate.object === "refund";
  }
  return false;
}

export const { POST } = createRouteHandlersForAction(webhookLogger);
