"use client";

import { createAdminSubscriptionCheckout } from "@/app/(auth)/sign-in/actions/create-checkout";
import { upgradeSubscription } from "@/app/(protected)/actions";
import { PlanType } from "@/models/plans";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { useServerAction } from "zsa-react";
import { Button } from "./ui/button";

export function SubscriptionPlansButton({
  plan,
  index,
  currentPlan,
}: {
  plan: PlanType;
  index: number;
  currentPlan: PlanType;
}) {
  const router = useRouter();

  const {
    execute: executeUpgrade,
    isPending: isPendingUpgrade,
    data: upgradeData,
  } = useServerAction(upgradeSubscription, {
    onSuccess: () => {
      console.log("Checkout realizado com sucesso!", upgradeData);
    },
    onError: (error) => {
      console.error("Erro ao realizar checkout:", error);
    },
  });

  const { execute: executeCreate, isPending: isPendingCreate } =
    useServerAction(createAdminSubscriptionCheckout, {
      onSuccess: ({ data: url }) => {
        if (url) {
          router.push(url);
        }
      },
      onError: ({ err }) => {
        console.error(err);
      },
    });

  function handleStartTrial() {
    // Salva cookies
    setCookie(null, "plan_id", plan.id, {
      maxAge: 60 * 60 * 24, // 1 dia
      path: "/",
    });
    setCookie(null, "price_id", plan.price_id, {
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Executa a server action
    executeCreate();
  }

  if (!currentPlan) {
    return (
      <Button
        className="w-full"
        variant={index === 0 ? "default" : "secondary"}
        onClick={handleStartTrial}
        disabled={isPendingCreate}
      >
        {isPendingCreate ? "Aguarde..." : "Começar teste grátis"}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      variant={index === 0 ? "default" : "secondary"}
      onClick={() =>
        executeUpgrade({ new_price_id: plan.price_id, new_plan_id: plan.id })
      }
      disabled={isPendingUpgrade}
    >
      {isPendingUpgrade ? "Aguarde..." : "Fazer Upgrade"}
    </Button>
  );
}
