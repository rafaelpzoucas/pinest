"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "zsa";

const createSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  storeId: z.string().optional(),
  planId: z.string().optional(),
  endDate: z.number(),
});

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  storeId: z.string().optional(),
});

export const createSubscription = createServerAction()
  .input(createSubscriptionSchema)
  .handler(async ({ input }) => {
    const supabase = createAdminClient();

    const { subscriptionId, planId, storeId } = input;

    if (!planId || !storeId) return;

    const { error } = await supabase.from("subscriptions").insert({
      subscription_id: subscriptionId,
      status: "active",
      plan_id: planId,
      store_id: storeId,
    });

    if (error) {
      console.error("Error updating store subscription", error);
    }

    revalidatePath("/");
  });

export const cancelSubscription = createServerAction()
  .input(cancelSubscriptionSchema)
  .handler(async ({ input }) => {
    const supabase = createAdminClient();

    const { storeId } = input;

    if (!storeId) return;

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", plan_id: null })
      .eq("store_id", storeId);

    if (error) {
      console.error("Error cancelling store subscription", error);
    }

    revalidatePath("/");
  });
