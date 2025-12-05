import { readStorePlan } from "@/app/(protected)/(app)/actions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn, formatCurrencyBRL } from "@/lib/utils";
import { FeatureKey, PLANS_FEATURES_MAP } from "@/models/plans";
import { CheckCircle2, Star } from "lucide-react";
import { SubscriptionPlansButton } from "./subscription-plans-button";
import { createAdminClient } from "@/lib/supabase/admin";

export async function SubscriptionPlans() {
  const supabase = createAdminClient();

  const [currentPlan] = await readStorePlan();

  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: false })
    .eq("environment", process.env.NODE_ENV);

  if (plansError) {
    console.error("Error fetching plans:", plansError);
    return null;
  }

  function getFeatureLabel(key: FeatureKey): string {
    return PLANS_FEATURES_MAP[key];
  }

  // Função para calcular o valor mensal do plano anual
  function getMonthlyPrice(annualPrice: number): number {
    return annualPrice / 12;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: fixed id is necessary for linking from other sections
    <section id="pricing" className="space-y-8">
      <h2 className="text-3xl font-bold text-center">
        {currentPlan
          ? "Faça Upgrade de Plano"
          : "Experimente o Pinest grátis por 14 dias"}
      </h2>

      <p className="text-center mt-4 text-muted-foreground">
        {currentPlan
          ? "Esta funcionalidade não está disponível no seu plano atual. Faça upgrade para desbloquear."
          : "Teste todas as funcionalidades da Pinest sem compromisso. Não cobramos nada nos primeiros 14 dias."}
      </p>

      <Tabs defaultValue="annualy" className="flex flex-col items-center">
        <TabsList className="h-fit mx-auto">
          <TabsTrigger value="annualy" className="h-14 px-6 text-xl">
            Anual (econômico)
          </TabsTrigger>
          <TabsTrigger value="monthly" className="h-14 px-6 text-xl">
            Mensal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="annualy" className="w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-center gap-8 mt-8">
            {plans
              ?.filter((plan) => plan.recurrence === "annualy")
              .map((plan, index) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative w-full max-w-xs",
                    index === 0 && "border-2 border-primary",
                  )}
                >
                  {index === 0 && (
                    <Badge className="absolute top-2 right-2">
                      <Star className="w-3 h-3 mr-2" /> Popular
                    </Badge>
                  )}

                  {currentPlan?.plan.id === plan.id && (
                    <Badge
                      className="absolute top-2 right-2"
                      variant="secondary"
                    >
                      Seu plano atual
                    </Badge>
                  )}
                  <CardHeader>
                    <CardDescription className="text-lg">
                      {plan.name}
                    </CardDescription>
                    <CardTitle className="flex flex-col items-start gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {formatCurrencyBRL(getMonthlyPrice(plan.price))}
                        </span>
                        <span className="text-base text-muted-foreground font-normal">
                          /mês
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Cobrado anualmente: {formatCurrencyBRL(plan.price)}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        14 dias de teste + 2 meses grátis
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <ul className="mt-4 space-y-2">
                      {Object.keys(plan.features).map((feature) => {
                        const value = plan.features[feature];

                        // só renderiza se não for false
                        if (value === false) return null;
                        return (
                          <li
                            key={feature}
                            className="flex flex-row items-center text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />{" "}
                            {getFeatureLabel(feature as FeatureKey)}
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>

                  {currentPlan?.plan.id !== plan.id && (
                    <CardFooter>
                      <SubscriptionPlansButton
                        index={index}
                        plan={plan}
                        currentPlan={currentPlan?.plan}
                      />
                    </CardFooter>
                  )}
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-center gap-8 mt-8">
            {plans
              ?.filter((plan) => plan.recurrence === "monthly")
              .map((plan, index) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative w-full max-w-xs",
                    index === 0 && "border-2 border-primary",
                  )}
                >
                  {index === 0 && (
                    <Badge className="absolute top-2 right-2">
                      <Star className="w-3 h-3 mr-2" /> Popular
                    </Badge>
                  )}

                  {currentPlan?.plan.id === plan.id && (
                    <Badge
                      className="absolute top-2 right-2"
                      variant="secondary"
                    >
                      Seu plano atual
                    </Badge>
                  )}
                  <CardHeader>
                    <CardDescription className="text-lg">
                      {plan.name}
                    </CardDescription>
                    <CardTitle className="flex flex-col items-start gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {formatCurrencyBRL(plan.price)}
                        </span>
                        <span className="text-base text-muted-foreground font-normal">
                          /mês
                        </span>
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        14 dias grátis
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <ul className="mt-4 space-y-2">
                      {Object.keys(plan.features).map((feature) => {
                        if (!plan.features[feature]) return null;
                        return (
                          <li
                            key={feature}
                            className="flex flex-row items-center text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />{" "}
                            {getFeatureLabel(feature as FeatureKey)}
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>

                  {currentPlan?.plan.id !== plan.id && (
                    <CardFooter>
                      <SubscriptionPlansButton
                        index={index}
                        plan={plan}
                        currentPlan={currentPlan?.plan}
                      />
                    </CardFooter>
                  )}
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
