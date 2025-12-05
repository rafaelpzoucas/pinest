"use server";

import { redirect } from "next/navigation";
import { createServerAction } from "zsa";
import { createAdminSubscriptionCheckout } from "./create-checkout";
import { ensureAdminUser } from "./ensure-admin-user";
import { exchangeCodeForSession } from "./exchange-code";
import { authCallbackInputSchema } from "./schemas";

export const adminAuthCallback = createServerAction()
  .input(authCallbackInputSchema)
  .handler(async ({ input }) => {
    // Step 1: Exchange code for session
    const [exchangeResult, exchangeError] = await exchangeCodeForSession(input);

    if (exchangeError) {
      return redirect("/sign-in?error=auth_failed");
    }

    const { origin } = exchangeResult;

    // Step 2: Ensure admin user exists
    const [userResult, userError] = await ensureAdminUser();

    if (userError) {
      console.error("Admin user error:", userError);
      return redirect("/sign-in?error=user_creation_failed");
    }

    const { adminUser, isNewUser } = userResult;

    // Step 3: Handle subscription for new users
    if (isNewUser && adminUser.subscription_status !== "active") {
      const [, subscriptionError] = await createAdminSubscriptionCheckout();

      if (subscriptionError) {
        console.error("Subscription error:", subscriptionError);
        // Não bloqueia o fluxo, mas loga o erro
      }
    }

    // Step 4: Redirect based on user state
    const redirectPath = isNewUser
      ? `${origin}/onboarding/store/basic`
      : `${origin}/dashboard`;

    return redirect(redirectPath);
  });
