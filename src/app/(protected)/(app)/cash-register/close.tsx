"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildProductsSoldReportESCPOS,
  buildSalesReportESCPOS,
} from "@/lib/receipts";
import { cn, formatCurrencyBRL, stringToNumber } from "@/lib/utils";
import type { PaymentType } from "@/models/payment";
import { printMultipleReports } from "../config/printing/actions";

import { CashForm } from "./cash-form";
import { ReceiptForm } from "./receipt-form";
import { closeCashSessionSchema } from "./schemas";
import { useCloseCashSession } from "@/features/cash-register/hooks";
import { useReadCashReceipts } from "@/features/cash-register/receipts/hooks";
import { useReadOpenTables } from "@/features/tables/hooks";
import { useReadOpenOrders } from "@/features/admin/orders/hooks";
import { useReadSalesReport } from "@/features/reports/sales/hooks";

// Função utilitária para retornar string vazia se o valor for zero
function emptyIfZero(value: number) {
  return value === 0 ? "" : value.toString();
}

export function CloseCashSession({
  cashSessionId,
  payments,
}: {
  cashSessionId?: string;
  payments: PaymentType[];
}) {
  const [sheet, setSheet] = useQueryState("sheet", parseAsString);
  const isSheetOpen = sheet === "close-cash";
  const setIsSheetOpen = (open: boolean) =>
    setSheet(open ? "close-cash" : null);

  // ✅ OTIMIZAÇÃO: Queries só executam quando o sheet está aberto
  const { data: cashReceipts = [], isLoading: loadingReceipts } =
    useReadCashReceipts({
      enabled: isSheetOpen, // 👈 SÓ busca quando abrir o sheet
    });
  const { data: openOrders = [], isLoading: loadingOrders } = useReadOpenOrders(
    {
      enabled: isSheetOpen, // 👈 SÓ busca quando abrir o sheet
    },
  );
  const { data: openTables = [], isLoading: loadingTables } = useReadOpenTables(
    {
      enabled: isSheetOpen, // 👈 SÓ busca quando abrir o sheet
    },
  );
  // Hook para buscar reports apenas se houver sessão
  const { data: reports, isLoading: loadingReports } =
    useReadSalesReport(cashSessionId);

  const hasOpenOrders = openOrders.length > 0;
  const hasOpenTables = openTables.length > 0;
  const isLoadingValidations =
    loadingReceipts || loadingOrders || loadingTables;

  const [isPrinting, setIsPrinting] = useState(false);
  const [manualInputAllowed, setManualInputAllowed] = useState({
    pix: false,
    credit: false,
    debit: false,
  });
  const [dialogOpen, setDialogOpen] = useState<
    null | "pix" | "credit" | "debit"
  >(null);
  const [cashManual, setCashManual] = useState(false);
  const [pixManual, setPixManual] = useState(false);
  const [creditManual, setCreditManual] = useState(false);
  const [debitManual, setDebitManual] = useState(false);
  const [showDifferenceDialog, setShowDifferenceDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<z.infer<
    typeof closeCashSessionSchema
  > | null>(null);

  // Estados dos valores dos campos via nuqs
  const [pixValue, setPixValue] = useQueryState("pixValue", parseAsString);
  const [creditValue, setCreditValue] = useQueryState(
    "creditValue",
    parseAsString,
  );
  const [debitValue, setDebitValue] = useQueryState(
    "debitValue",
    parseAsString,
  );
  const [cashValue, setCashValue] = useQueryState("cashValue", parseAsString);

  const cashReceiptsMoney =
    cashReceipts?.filter((receipt) => receipt.type.startsWith("cash_")) || [];
  const pixReceipts =
    cashReceipts?.filter((receipt) => receipt.type === "pix") || [];
  const creditReceipts =
    cashReceipts?.filter((receipt) => receipt.type === "credit") || [];
  const debitReceipts =
    cashReceipts?.filter((receipt) => receipt.type === "debit") || [];

  const initialAmount = payments.find(
    (payment) => payment.description === "Abertura de caixa",
  )?.amount;

  const computedTotals = payments.reduce(
    (acc, payment) => {
      const typeMap = {
        CREDIT: "Credito",
        DEBIT: "Debito",
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

  const computedCash = (initialAmount || 0) + (computedTotals.Dinheiro || 0);
  const computedPix = computedTotals.PIX || 0;
  const computedCredit = computedTotals.Credito || 0;
  const computedDebit = computedTotals.Debito || 0;

  const declaredCash = cashReceiptsMoney.reduce((acc, receipt) => {
    return acc + receipt.total;
  }, 0);
  const declaredPix = pixReceipts.reduce((acc, receipt) => {
    return acc + receipt.total;
  }, 0);
  const declaredCredit = creditReceipts.reduce((acc, receipt) => {
    return acc + receipt.total;
  }, 0);
  const declaredDebit = debitReceipts.reduce((acc, receipt) => {
    return acc + receipt.total;
  }, 0);

  const totalDeclaredInitial =
    declaredCash + declaredPix + declaredCredit + declaredDebit;

  const form = useForm<z.infer<typeof closeCashSessionSchema>>({
    resolver: zodResolver(closeCashSessionSchema),
    defaultValues: {
      pix_balance: pixValue ? String(stringToNumber(pixValue)) : "",
      credit_balance: creditValue ? String(stringToNumber(creditValue)) : "",
      debit_balance: debitValue ? String(stringToNumber(debitValue)) : "",
      cash_balance: cashValue ? String(stringToNumber(cashValue)) : "",
      closing_balance: emptyIfZero(totalDeclaredInitial),
    },
  });

  const totalComputed =
    computedCash + computedPix + computedCredit + computedDebit;
  const totalDeclared =
    stringToNumber(form.watch("cash_balance")) +
    stringToNumber(form.watch("pix_balance")) +
    stringToNumber(form.watch("credit_balance")) +
    stringToNumber(form.watch("debit_balance"));

  const difference = totalDeclared - totalComputed;

  // Hook do react-query para fechar caixa
  const { mutate: closeCash, isPending } = useCloseCashSession();

  async function handlePrintReports() {
    try {
      const salesReportText = buildSalesReportESCPOS(reports?.salesReport);

      const [, error] = await printMultipleReports({
        reports: [
          {
            name: "Relatório de Vendas",
            raw: salesReportText,
          },
          {
            name: "Produtos Vendidos",
            raw: buildProductsSoldReportESCPOS(reports?.productsSold),
          },
        ],
      });

      if (error) {
        console.error("Erro ao imprimir múltiplos relatórios", error);
      }
    } catch (error) {
      console.error("Erro ao imprimir relatórios:", error);
    }
  }

  function handleConfirmClose() {
    if (pendingValues) {
      setIsPrinting(true);
      closeCash(pendingValues, {
        onSuccess: () => {
          handlePrintReports();
          setIsSheetOpen(false);
          form.reset();

          // Limpa os query params após fechar o caixa
          setPixValue(null);
          setCreditValue(null);
          setDebitValue(null);
          setCashValue(null);

          toast(
            `Caixa fechado com diferença de ${formatCurrencyBRL(Math.abs(difference))}`,
          );
          setIsPrinting(false);
          setShowDifferenceDialog(false);
          setPendingValues(null);
        },
        onError: () => {
          setIsPrinting(false);
        },
      });
    }
  }

  function onSubmit(values: z.infer<typeof closeCashSessionSchema>) {
    if (difference !== 0) {
      setPendingValues(values);
      setShowDifferenceDialog(true);
      return;
    }

    setIsPrinting(true);
    closeCash(values, {
      onSuccess: () => {
        handlePrintReports();
        setIsSheetOpen(false);
        form.reset();

        // Limpa os query params após fechar o caixa
        setPixValue(null);
        setCreditValue(null);
        setDebitValue(null);
        setCashValue(null);

        setIsPrinting(false);
      },
      onError: () => {
        setIsPrinting(false);
      },
    });
  }

  // Inicializa os valores apenas uma vez quando o componente monta
  useEffect(() => {
    // Só inicializa se os campos estiverem vazios (primeira vez)
    const currentValues = form.getValues();
    if (
      !currentValues.cash_balance &&
      !currentValues.pix_balance &&
      !currentValues.credit_balance &&
      !currentValues.debit_balance
    ) {
      form.setValue("cash_balance", emptyIfZero(declaredCash));
      form.setValue("pix_balance", emptyIfZero(declaredPix));
      form.setValue("credit_balance", emptyIfZero(declaredCredit));
      form.setValue("debit_balance", emptyIfZero(declaredDebit));
      form.setValue("closing_balance", emptyIfZero(totalDeclaredInitial));
    }
  }, []); // Remove as dependências para executar apenas uma vez

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === "cash_balance" ||
        name === "pix_balance" ||
        name === "credit_balance" ||
        name === "debit_balance"
      ) {
        const newTotal =
          stringToNumber(value.cash_balance) +
          stringToNumber(value.pix_balance) +
          stringToNumber(value.credit_balance) +
          stringToNumber(value.debit_balance);

        form.setValue("closing_balance", newTotal.toString());
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    // CASH
    if (!cashManual) {
      form.setValue("cash_balance", emptyIfZero(declaredCash));
    }
    // PIX
    if (pixReceipts.length > 0 && pixManual) {
      setPixManual(false);
      form.setValue("pix_balance", emptyIfZero(declaredPix));
    }
    if (pixReceipts.length === 0 && !pixManual) {
      form.setValue("pix_balance", emptyIfZero(declaredPix));
    }
    // CREDIT
    if (creditReceipts.length > 0 && creditManual) {
      setCreditManual(false);
      form.setValue("credit_balance", emptyIfZero(declaredCredit));
    }
    if (creditReceipts.length === 0 && !creditManual) {
      form.setValue("credit_balance", emptyIfZero(declaredCredit));
    }
    // DEBIT
    if (debitReceipts.length > 0 && debitManual) {
      setDebitManual(false);
      form.setValue("debit_balance", emptyIfZero(declaredDebit));
    }
    if (debitReceipts.length === 0 && !debitManual) {
      form.setValue("debit_balance", emptyIfZero(declaredDebit));
    }

    form.setValue(
      "closing_balance",
      emptyIfZero(
        stringToNumber(form.getValues("cash_balance")) +
          stringToNumber(form.getValues("pix_balance")) +
          stringToNumber(form.getValues("credit_balance")) +
          stringToNumber(form.getValues("debit_balance")),
      ),
    );
  }, [
    declaredCash,
    declaredPix,
    declaredCredit,
    declaredDebit,
    pixReceipts.length,
    creditReceipts.length,
    debitReceipts.length,
    pixManual,
    creditManual,
    debitManual,
  ]);

  useEffect(() => {
    if (isSheetOpen) {
      form.reset({
        pix_balance: pixValue ? String(stringToNumber(pixValue)) : "",
        credit_balance: creditValue ? String(stringToNumber(creditValue)) : "",
        debit_balance: debitValue ? String(stringToNumber(debitValue)) : "",
        cash_balance: cashValue ? String(stringToNumber(cashValue)) : "",
        closing_balance: emptyIfZero(totalDeclaredInitial),
      });
    }
    // eslint-disable-next-line
  }, [isSheetOpen]);

  // Função utilitária para abrir um filho e fechar o pai
  function handleOpenChildSheet(sheetKey: string) {
    setSheet(sheetKey);
  }

  // Função utilitária para controlar reabertura do pai ao fechar o filho
  function handleChildSheetChange(open: boolean, sheetKey: string) {
    if (!open) {
      setSheet("close-cash");
    }
  }

  const handleConfirmManualInput = (type: "pix" | "credit" | "debit") => {
    // Limpa os recibos do tipo e libera o input
    if (type === "pix") {
      pixReceipts.length = 0;
    } else if (type === "credit") {
      creditReceipts.length = 0;
    } else if (type === "debit") {
      debitReceipts.length = 0;
    }
    setManualInputAllowed((prev) => ({ ...prev, [type]: true }));
    setDialogOpen(null);
  };

  const INPUT_TYPES = [
    {
      name: "cash_balance",
      label: "Dinheiro",
      form: "cash-form",
      computed: computedCash,
      type: "cash",
    },
    {
      name: "pix_balance",
      label: "PIX",
      form: "pix-form",
      computed: computedPix,
      type: "pix",
    },
    {
      name: "credit_balance",
      label: "Cartão de crédito",
      form: "credit-form",
      computed: computedCredit,
      type: "credit",
    },
    {
      name: "debit_balance",
      label: "Cartão de débito",
      form: "debit-form",
      computed: computedDebit,
      type: "debit",
    },
  ];

  return (
    <>
      {/* Dialog de confirmação para liberar input manual */}
      <Dialog
        open={!!dialogOpen}
        onOpenChange={(open) => setDialogOpen(open ? dialogOpen : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja informar o valor manualmente?</DialogTitle>
            <DialogDescription>
              Isso irá descartar todas as transações manuais desse tipo. Tem
              certeza que deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Cancelar
            </Button>
            <Button onClick={() => handleConfirmManualInput(dialogOpen!)}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={showDifferenceDialog}
        onOpenChange={setShowDifferenceDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar caixa com diferença?</AlertDialogTitle>
            <AlertDialogDescription>
              Existe uma diferença de {formatCurrencyBRL(Math.abs(difference))}{" "}
              entre o valor declarado e o esperado. Tem certeza que deseja
              fechar o caixa assim mesmo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDifferenceDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Confirmar fechamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {/* ✅ Mostra loading enquanto valida */}
        {isLoadingValidations ? (
          <Button className="w-full mt-2" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Validando...
          </Button>
        ) : hasOpenOrders || hasOpenTables ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button className="cursor-not-allowed opacity-50 w-full mt-2">
                  Fechar caixa
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Você ainda tem pedidos ou mesas em aberto.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <SheetTrigger className={cn(buttonVariants(), "w-full mt-2")}>
            Fechar caixa
          </SheetTrigger>
        )}
        <SheetContent className="space-y-4">
          <SheetHeader className="items-start mb-4">
            <div className="flex flex-row items-center gap-2">
              <SheetClose
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <ArrowLeft />
              </SheetClose>
              <SheetTitle className="!mt-0">Fechamento de caixa</SheetTitle>
            </div>
            <SheetDescription className="!mt-0 text-left">
              Os valores podem ser editados manualmente ou preenchidos através
              dos recibos.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {INPUT_TYPES.map((input) => {
                const type = input.type as "cash" | "pix" | "credit" | "debit";
                const hasReceipts =
                  (type === "pix" && pixReceipts.length > 0) ||
                  (type === "credit" && creditReceipts.length > 0) ||
                  (type === "debit" && debitReceipts.length > 0);
                const isBlocked = hasReceipts && !manualInputAllowed[type];
                return (
                  <FormField
                    key={input.name}
                    control={form.control}
                    name={
                      input.name as unknown as
                        | "closing_balance"
                        | "cash_balance"
                        | "credit_balance"
                        | "debit_balance"
                        | "pix_balance"
                    }
                    render={({ field }) => {
                      const handleManualChange = (e: any) => {
                        const rawValue = e.target.value;
                        const numericValue = String(stringToNumber(rawValue));
                        if (type === "pix") {
                          setPixManual(true);
                          setPixValue(numericValue);
                        }
                        if (type === "credit") {
                          setCreditManual(true);
                          setCreditValue(numericValue);
                        }
                        if (type === "debit") {
                          setDebitManual(true);
                          setDebitValue(numericValue);
                        }
                        if (type === "cash") {
                          setCashManual(true);
                          setCashValue(numericValue);
                        }
                        field.onChange(e);
                      };
                      const handleBlur = () => {
                        // Se o campo for limpo, reseta o estado manual
                        if (!field.value) {
                          if (type === "pix") setPixManual(false);
                          if (type === "credit") setCreditManual(false);
                          if (type === "debit") setDebitManual(false);
                          if (type === "cash") setDebitManual(false);
                        }
                        if (field.onBlur) field.onBlur();
                      };
                      return (
                        <FormItem>
                          <div className="flex flex-row justify-between">
                            <FormLabel>{input.label}</FormLabel>
                            <FormDescription>
                              Esperado: {formatCurrencyBRL(input.computed)}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <div className="flex flex-row gap-2 items-center">
                              {isBlocked ? (
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <span
                                        className="flex items-center w-full border rounded-md px-3 py-2 text-sm h-9 bg-secondary/30
                                          select-none cursor-not-allowed"
                                      >
                                        {formatCurrencyBRL(
                                          stringToNumber(field.value),
                                        )}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md">
                                      O campo está bloqueado porque existem
                                      transações manuais. Para informar o valor
                                      manualmente, descarte as transações.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <Input
                                  maskType="currency"
                                  placeholder="Insira o valor final..."
                                  {...field}
                                  onChange={handleManualChange}
                                  onBlur={handleBlur}
                                />
                              )}
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleOpenChildSheet(input.form)}
                              >
                                <Plus />
                                Inserir{" "}
                                {type === "cash" ? "cédulas" : "recibos"}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                );
              })}

              <FormField
                control={form.control}
                name="closing_balance"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-row justify-between">
                      <FormLabel>Saldo final</FormLabel>
                      <FormDescription>
                        Esperado:{" "}
                        {formatCurrencyBRL(
                          computedCash +
                            computedPix +
                            computedCredit +
                            computedDebit,
                        )}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <span
                        className="flex items-center w-full border rounded-md px-3 py-2 text-sm h-9 bg-secondary/30
                          select-none cursor-not-allowed"
                      >
                        {formatCurrencyBRL(stringToNumber(field.value))}
                      </span>
                    </FormControl>
                    <FormDescription>
                      Dinheiro + Recibos de cartão + PIX - Saídas
                    </FormDescription>
                    {difference !== 0 ? (
                      <FormMessage className="text-amber-600">
                        ⚠️ Diferença: {formatCurrencyBRL(difference)} -
                        Verifique os valores antes de fechar
                      </FormMessage>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending || isPrinting}
                className="w-full lg:w-auto"
              >
                {isPrinting || isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Fechando caixa</span>
                  </>
                ) : (
                  "Fechar caixa e imprimir"
                )}
              </Button>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Sheets filhos controlados pelo pai */}
      <CashForm
        receipts={cashReceiptsMoney}
        open={sheet === "cash-form"}
        setOpen={(open) => handleChildSheetChange(open, "cash-form")}
        computedValue={computedCash}
        setCashValue={setCashValue}
      />
      <ReceiptForm
        type="pix"
        receipts={pixReceipts}
        open={sheet === "pix-form"}
        setOpen={(open) => handleChildSheetChange(open, "pix-form")}
        computedValue={computedPix}
        setPixValue={setPixValue}
      />
      <ReceiptForm
        type="credit"
        receipts={creditReceipts}
        open={sheet === "credit-form"}
        setOpen={(open) => handleChildSheetChange(open, "credit-form")}
        computedValue={computedCredit}
        setCreditValue={setCreditValue}
      />
      <ReceiptForm
        type="debit"
        receipts={debitReceipts}
        open={sheet === "debit-form"}
        setOpen={(open) => handleChildSheetChange(open, "debit-form")}
        computedValue={computedDebit}
        setDebitValue={setDebitValue}
      />
    </>
  );
}
