import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCashRegister } from "@/stores/cashRegisterStore";
import { LayoutPanelTop, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReadCashSession } from "@/features/cash-register/hooks";
import { useReadOpenTables } from "@/features/tables/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCard } from "./table-card";

export function Tables() {
  const [search, setSearch] = useState("");

  const { setIsCashOpen, isCashOpen } = useCashRegister();

  const { data: cashSession, isLoading: isCashLoading } = useReadCashSession();

  const { data: tables, isLoading: isTablesLoading } = useReadOpenTables();

  useEffect(() => {
    setIsCashOpen(!!cashSession);
  }, [cashSession, setIsCashOpen]);

  return (
    <TooltipProvider delayDuration={300}>
      <section className="flex flex-col gap-4 text-sm">
        <header className="flex flex-col lg:flex-row gap-4">
          <Link
            href="orders/tables/register"
            className={cn(buttonVariants(), "w-full max-w-sm")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Abrir mesa
          </Link>

          <div className="relative w-full">
            <Search className="absolute top-2 left-3 w-5 h-5 text-muted-foreground" />

            <Input
              placeholder="Buscar mesa..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {isTablesLoading && (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-[262px]" />
              ))}
            </>
          )}

          {!isTablesLoading &&
            tables &&
            tables.length > 0 &&
            tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                isCashOpen={isCashOpen}
                isCashLoading={isCashLoading}
              />
            ))}
        </div>

        {!tables ||
          (tables.length === 0 && (
            <div className="flex flex-col gap-4 items-center justify-center text-muted-foreground">
              <LayoutPanelTop className="w-32 h-32 opacity-30" />
              <p>Nenhuma mesa aberta.</p>
            </div>
          ))}
      </section>
    </TooltipProvider>
  );
}
