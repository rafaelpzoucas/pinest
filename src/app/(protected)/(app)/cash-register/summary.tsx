// cash-register/summary.tsx
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import { PaymentType } from "@/models/payment";
import { CloseCashSession } from "./close";

export function CashRegisterSummary({
  payments,
  cashSessionId,
}: {
  payments: PaymentType[];
  cashSessionId?: string;
}) {
  const initialAmount = payments.find(
    (payment) => payment.description === "Abertura de caixa",
  )?.amount;

  const incomePayments = payments.filter(
    (payments) => payments.type === "INCOME",
  );
  const expensePayments = payments.filter(
    (payments) => payments.type === "EXPENSE",
  );

  const incomeTotals = incomePayments.reduce(
    (acc, payment) => {
      const typeMap = {
        CREDIT_CARD: "Cartão de crédito",
        DEBIT_CARD: "Cartão de débito",
        CASH: "Dinheiro",
        PIX: "PIX",
        DEFERRED: "Prazo",
      } as const;

      const key = typeMap[payment.payment_type as keyof typeof typeMap];

      if (key) {
        acc[key] = (acc[key] || 0) + payment.amount;
      }

      return acc;
    },
    {} as Record<string, number>,
  );

  const expenseTotals = expensePayments.reduce(
    (acc, payment) => {
      const typeMap = {
        CREDIT_CARD: "Cartão de crédito",
        DEBIT_CARD: "Cartão de débito",
        CASH: "Dinheiro",
        PIX: "PIX",
        DEFERRED: "Prazo",
      } as const;

      const key = typeMap[payment.payment_type as keyof typeof typeMap];

      if (key) {
        acc[key] = (acc[key] || 0) + payment.amount;
      }

      return acc;
    },
    {} as Record<string, number>,
  );

  const totalIncome = Object.values(incomePayments).reduce(
    (acc, value) => acc + value.amount,
    0,
  );
  const totalExpense = Object.values(expensePayments).reduce(
    (acc, value) => acc + value.amount,
    0,
  );
  const cashBalance =
    (initialAmount || 0) +
    (incomeTotals.Dinheiro || 0) -
    (expenseTotals.Dinheiro || 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do caixa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <header className="flex flex-row items-center justify-between">
          <span>Saldo inicial</span>
          <span>{formatCurrencyBRL(initialAmount ?? 0)}</span>
        </header>

        <div>
          <h3>Entradas</h3>

          {Object.keys(incomeTotals).map((key) => {
            const typedKey = key as keyof typeof incomeTotals;
            return (
              <div
                key={key}
                className="flex flex-row items-center justify-between text-muted-foreground py-1 border-t
                  text-sm"
              >
                <span>{key}</span>
                <span>{formatCurrencyBRL(incomeTotals[typedKey])}</span>
              </div>
            );
          })}

          <footer className="flex flex-row items-center justify-between">
            <span>Total</span>
            <span>{formatCurrencyBRL(totalIncome ?? 0)}</span>
          </footer>
        </div>
        <div>
          <h3>Saídas</h3>

          {Object.keys(expenseTotals).map((key) => {
            const typedKey = key as keyof typeof expenseTotals;
            return (
              <div
                key={key}
                className="flex flex-row items-center justify-between text-muted-foreground py-1 border-t
                  text-sm"
              >
                <span>{key}</span>
                <span>{formatCurrencyBRL(expenseTotals[typedKey])}</span>
              </div>
            );
          })}

          <footer className="flex flex-row items-center justify-between">
            <span>Total</span>
            <span>{formatCurrencyBRL(totalExpense ?? 0)}</span>
          </footer>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        <h3>Saldo final</h3>

        <div
          className="flex flex-row items-center justify-between text-muted-foreground py-1 border-t
            text-sm w-full"
        >
          <span>Somente dinheiro</span>
          <span>{formatCurrencyBRL(cashBalance ?? 0)}</span>
        </div>
        <div className="flex flex-row items-center justify-between py-1 border-t w-full">
          <span>Tudo</span>
          <span>{formatCurrencyBRL(totalBalance ?? 0)}</span>
        </div>

        <CloseCashSession cashSessionId={cashSessionId} payments={payments} />
      </CardFooter>
    </Card>
  );
}
