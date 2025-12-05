"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerAction, ZSAError } from "zsa";
import { createAdminSubscriptionSchema } from "./schemas";

export const createAdminSubscription = createServerAction()
  .input(createAdminSubscriptionSchema)
  .handler(async ({ input }) => {
    const supabase = createAdminClient();

    if (!input.plan_id || !input.store_id) return;

    const { error } = await supabase.from("subscriptions").insert({
      subscription_id: input.subscription_id,
      status: "active",
      plan_id: input.plan_id,
      store_id: input.store_id,
    });

    if (error) {
      throw new ZSAError(
        "INTERNAL_SERVER_ERROR",
        `Could not create subscription, cause: ${error.message}`,
      );
    }
  });
