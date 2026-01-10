"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { OrderType } from "@/models/order";
import { format } from "date-fns";
import { Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useServerAction } from "zsa-react";
import { createOrderFormSchema } from "../schemas";
import { readCustomerLastOrders } from "./actions";

export function LastOrders({
  customerId,
  form,
}: {
  customerId: string;
  form: UseFormReturn<z.infer<typeof createOrderFormSchema>>;
}) {
  const [lastOrders, setLastOrders] = useState<OrderType[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { execute, isPending, data } = useServerAction(readCustomerLastOrders, {
    onSuccess: () => {
      if (data?.lastOrders) {
        setLastOrders(data?.lastOrders);
      }
    },
  });

  function handleSelect(order: OrderType) {
    setIsOpen(false);

    const formattedItems = order.order_items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      product_price: item.product_price,
      observations: item.observations || [],
      extras:
        item.extras?.map((extra) => ({
          name: extra.name,
          price: extra.price,
          extra_id: extra.id,
          quantity: extra.quantity,
        })) || [],
    }));

    form.setValue("order_items", formattedItems);
  }

  async function handleGetCustomerLastOrders() {
    execute({ customerId });
  }

  useEffect(() => {
    handleGetCustomerLastOrders();
  }, [customerId]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "outline" }))}>
        <Clock /> Ver últimos pedidos
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-dvh">
          <SheetHeader>
            <SheetTitle>Últimos pedidos</SheetTitle>
            <SheetDescription>
              Os 5 pedidos mais recentes feitos pelo cliente
            </SheetDescription>
          </SheetHeader>

          {isPending ? (
            <p>Carregando...</p>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              {lastOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <header className="flex flex-row justify-between w-full">
                    <span className="text-muted-foreground">
                      {format(order.created_at, "dd/MM HH:mm")}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => handleSelect(order)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Selecionar
                    </Button>
                  </header>

                  {order.order_items
                    .filter((item) => item?.products)
                    .map((item) => (
                      <div key={item.id}>
                        <p>
                          {item.quantity} {item?.products?.name}
                        </p>
                        {item.extras.map((extra) => (
                          <p key={extra.id}>
                            + {extra.quantity} ad. {extra.name}
                          </p>
                        ))}
                      </div>
                    ))}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
