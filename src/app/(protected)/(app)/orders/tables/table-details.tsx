import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import { Table } from "@/features/tables/schemas";
import { ArrowLeft, Asterisk, Plus } from "lucide-react";
import Link from "next/link";
import { TableOptions } from "./table-options";

type TableDetailsProps = {
  table: Table;
  totalAmount: number;
  isCashOpen: boolean;
  isCashLoading: boolean;
  onClose: () => void;
};

export function TableDetails({
  table,
  totalAmount,
  isCashOpen,
  isCashLoading,
  onClose,
}: TableDetailsProps) {
  const orderItems = table.order_items || [];

  return (
    <ScrollArea className="h-dvh pb-16 px-6">
      <SheetHeader className="flex flex-row items-center">
        <SheetClose>
          <ArrowLeft className="mr-4" />
        </SheetClose>

        <div className="flex flex-col">
          <SheetTitle className="!mt-0">Mesa #{table.number}</SheetTitle>
          {table.description && (
            <SheetDescription>{table.description}</SheetDescription>
          )}
        </div>
      </SheetHeader>

      <section className="py-4 w-full flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <p>Total da mesa:</p>
          <span>{formatCurrencyBRL(totalAmount)}</span>
        </div>

        <TableOptions
          table={table}
          isCashOpen={isCashOpen}
          isCashLoading={isCashLoading}
        />
      </section>

      <section className="flex flex-col gap-2 relative h-full">
        <h1 className="text-lg font-bold mb-2">Itens da mesa</h1>

        <div className="flex flex-col gap-2">
          <Link
            href={`orders/tables/register?id=${table.id}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full max-w-sm",
            )}
          >
            <span className="flex flex-row items-center">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar produtos
            </span>
          </Link>

          {orderItems.length > 0 &&
            orderItems.map((item) => {
              const itemTotal = item.product_price;
              const extrasTotal = item.extras.reduce((acc, extra) => {
                return acc + extra.price * extra.quantity;
              }, 0);
              const total = (itemTotal + extrasTotal) * item.quantity;

              return (
                <Card key={item.id} className="p-4 space-y-2">
                  <header className="flex flex-row items-start justify-between gap-4 text-sm">
                    <strong className="line-clamp-2 uppercase">
                      {item.quantity} {item?.products?.name}
                    </strong>
                    <span>{formatCurrencyBRL(item?.products?.price ?? 0)}</span>
                  </header>

                  {item.extras.length > 0 &&
                    item.extras.map((extra, index) => (
                      <p
                        key={index}
                        className="flex flex-row items-center justify-between w-full text-muted-foreground"
                      >
                        <span className="flex flex-row items-center">
                          <Plus className="w-3 h-3 mr-1" /> {extra.quantity} ad.{" "}
                          {extra.name}
                        </span>
                        <span>
                          {formatCurrencyBRL(extra.price * extra.quantity)}
                        </span>
                      </p>
                    ))}

                  <div className="flex flex-col">
                    {item.observations &&
                      item.observations.length > 0 &&
                      item.observations.map((obs, index) => (
                        <span
                          key={index}
                          className="flex flex-row items-center text-muted-foreground uppercase"
                        >
                          <Asterisk className="w-3 h-3 mr-1" />
                          {obs}
                        </span>
                      ))}
                  </div>

                  <footer className="flex flex-row items-center justify-between">
                    <p>Total:</p>
                    <span>{formatCurrencyBRL(total)}</span>
                  </footer>
                </Card>
              );
            })}
        </div>
      </section>
    </ScrollArea>
  );
}
