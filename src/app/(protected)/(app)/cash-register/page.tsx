"use client";

import { DollarSign, Loader2 } from "lucide-react";
import { CreateTransactionForm } from "./create-transaction-form";
import { columns } from "./data-table/columns";
import { DataTable } from "./data-table/table";
import { OpenCashSession } from "./open";
import { CashRegisterSummary } from "./summary";
import { useReadCashSession } from "@/features/cash-register/hooks";
import { useReadCashSessionPayments } from "@/features/cash-register/transactions/hooks";
import { useReadSalesReport } from "@/features/reports/sales/hooks";

export default function CashRegister() {
  // Hooks para buscar dados
  const { data: cashSession, isLoading: loadingSession } = useReadCashSession();
  const { data: payments = [], isLoading: loadingPayments } =
    useReadCashSessionPayments();

  // Hook para buscar reports apenas se houver sessão
  const { data: reports, isLoading: loadingReports } = useReadSalesReport(
    cashSession?.id,
  );

  const isLoading = loadingSession || loadingPayments || loadingReports;

  // Loading state inicial
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 pb-16 lg:px-0 w-screen lg:w-full">
        <div
          className="w-full h-[60vh] flex flex-col gap-4 items-center justify-center
            text-muted-foreground"
        >
          <Loader2 className="w-12 h-12 animate-spin" />
          <p>Carregando caixa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-16 lg:px-0 w-screen lg:w-full">
      <div>
        {!cashSession && (
          <section className="space-y-6">
            <OpenCashSession />

            <div
              className="w-full h-full flex flex-col gap-6 items-center justify-center
                text-muted-foreground text-center"
            >
              <DollarSign className="w-32 h-32" />
              <p className="max-w-md">
                O caixa ainda não foi aberto. Inicie uma sessão para registrar o
                fluxo de entradas e saídas.
              </p>
            </div>
          </section>
        )}
        {cashSession && (
          <section className="space-y-6">
            <header className="flex flex-row gap-4">
              <CreateTransactionForm />
            </header>

            <div className="flex flex-col-reverse lg:grid lg:grid-cols-[2fr_1fr] items-start gap-4">
              <DataTable data={payments} columns={columns} />

              <aside className="lg:sticky top-4 w-full lg:w-auto">
                <CashRegisterSummary payments={payments} reports={reports} />
              </aside>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
