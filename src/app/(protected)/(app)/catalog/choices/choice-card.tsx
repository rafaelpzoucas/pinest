import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Choice } from "@/features/store/choices/schemas";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { ChoiceOptions } from "./options";

export function ChoiceCard({ choice }: { choice?: Choice }) {
  if (!choice) {
    return (
      <Card>
        <Skeleton className="w-full min-w-14 aspect-square rounded-card" />

        <div className="flex flex-col gap-1">
          <div className="leading-4">
            <Skeleton className="w-2/3 h-3" />
          </div>

          <Skeleton className="w-full h-[0.875rem]" />
          <Skeleton className="w-1/2 h-[0.875rem]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative p-3">
      <div className="grid grid-cols-[1fr_5fr] gap-4 items-start">
        <div className={"flex flex-col gap-1"}>
          <p
            className={
              "line-clamp-2 text-muted-foreground text-sm max-w-[220px]"
            }
          >
            {choice.name}
          </p>
          <p
            className={
              "line-clamp-2 text-muted-foreground text-sm max-w-[220px]"
            }
          >
            {choice.description}
          </p>

          <div className="leading-4">
            <p className={cn("text-sm text-primary")}>
              {formatCurrencyBRL(
                choice?.prices[0] && choice?.prices.length > 0
                  ? choice.prices[0].price
                  : 0,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-1 right-1">
        <ChoiceOptions choiceId={choice.id} />
      </div>
    </Card>
  );
}
