"use client";

import { Pyramid, Timer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Store } from "@/features/store/initial-data/schemas";
import { formatCurrencyBRL } from "@/lib/utils";
import { Status } from "./(status)/status";

export function StoreHeader({ store }: { store: Store | null }) {
  const logoURL = store?.logo_url ?? undefined;
  const delivery = store?.shippings?.[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-0 h-[45vh] flex items-center justify-center p-6">
      <div className="flex flex-col gap-3 items-center">
        <Avatar className="w-48 h-48">
          <AvatarImage src={logoURL} className="object-cover" />
          <AvatarFallback>
            <Pyramid />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center justify-center gap-1">
          <h1 className="text-center text-2xl capitalize font-bold">
            {store?.name}
          </h1>
          <Status />
        </div>
        <div className="flex flex-row gap-2">
          {delivery?.pickup ? (
            <Card className="flex flex-row items-center gap-2 p-2">
              <Timer className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Retirada</span>
                <strong className="text-sm">~{delivery.pickup_time}min</strong>
              </div>
            </Card>
          ) : null}

          {delivery?.status && delivery.delivery_time ? (
            <Card className="flex flex-row items-center gap-2 p-2">
              <Timer className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Entrega</span>
                <strong className="text-sm">
                  {delivery.delivery_time} - {delivery.delivery_time + 10}min
                  &bull; {formatCurrencyBRL(delivery.price ?? 0)}
                </strong>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </header>
  );
}
