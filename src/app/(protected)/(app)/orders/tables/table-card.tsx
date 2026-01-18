// TableCard.tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn, formatCurrencyBRL, formatDate } from "@/lib/utils";
import { Table } from "@/features/tables/schemas";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { TableDetails } from "./table-details";
import { TableOptions } from "./table-options";

type TableCardProps = {
  table: Table;
  isCashOpen: boolean;
  isCashLoading: boolean;
};

export function TableCard({
  table,
  isCashOpen,
  isCashLoading,
}: TableCardProps) {
  const [openSheet, setOpenSheet] = useState(false);

  const orderItems = table.order_items || [];
  const totalAmount = orderItems.reduce((acc, item) => {
    const extras = Array.isArray(item.extras) ? item.extras : [];

    const extrasTotalPerUnit = extras.reduce((acc, extra) => {
      const price = Number(extra.price) || 0;
      const quantity = Number(extra.quantity) || 0;
      return acc + price * quantity;
    }, 0);

    const productQuantity = Number(item.quantity) || 0;
    const productPrice = Number(item.product_price) || 0;

    const extrasTotal = extrasTotalPerUnit * productQuantity;
    const productsTotal = productPrice * productQuantity;

    return acc + productsTotal + extrasTotal;
  }, 0);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <Card className="flex flex-col gap-2 p-4 hover:bg-accent/50 transition-colors">
        <SheetTrigger asChild>
          <header className="flex flex-row items-center cursor-pointer">
            <Badge variant="secondary" className="text-xl">
              Mesa #{table.number}
            </Badge>

            <span
              className={cn(
                "text-xs text-muted-foreground ml-auto whitespace-nowrap",
              )}
            >
              {formatDate(table.created_at, "dd/MM HH:mm")}
            </span>

            <ChevronRight className="w-4 h-4 ml-2" />
          </header>
        </SheetTrigger>

        {table.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {table.description}
          </p>
        )}

        <section className="pr-1 text-xs space-y-1 border-t border-dashed pt-2">
          {orderItems.slice(0, 3).map((item) => {
            const itemTotal = item.product_price * item.quantity;

            return (
              <div className="flex flex-row justify-between" key={item.id}>
                <span className="line-clamp-1">
                  {item.quantity} {item.products?.name}
                </span>
                <strong className="whitespace-nowrap ml-2">
                  {formatCurrencyBRL(itemTotal)}
                </strong>
              </div>
            );
          })}

          {orderItems.length > 3 && (
            <p className="text-muted-foreground italic">
              +{orderItems.length - 3}{" "}
              {orderItems.length - 3 === 1 ? "item" : "itens"}
            </p>
          )}

          <div className="flex flex-row justify-between text-base pt-1">
            <span>Total:</span>
            <strong>{formatCurrencyBRL(totalAmount)}</strong>
          </div>
        </section>

        <footer className="flex w-full border-t mt-2 pt-2">
          <TableOptions
            table={table}
            isCashOpen={isCashOpen}
            isCashLoading={isCashLoading}
          />
        </footer>
      </Card>

      <SheetContent className="px-0">
        <TableDetails
          table={table}
          totalAmount={totalAmount}
          isCashOpen={isCashOpen}
          isCashLoading={isCashLoading}
          onClose={() => setOpenSheet(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
