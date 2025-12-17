"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrencyBRL } from "@/lib/utils";
import {
  useDeleteCashReceipt,
  useUpsertCashReceipts,
} from "@/features/cash-register/receipts/hooks";
import { createCashReceiptsSchema } from "@/features/cash-register/schemas";

const TITLES = {
  pix: "PIX",
  credit: "Cartão de crédito",
  debit: "Cartão de débito",
  cash: "Dinheiro",
};
const DESCRIPTIONS = {
  pix: "Insira cada transação de PIX",
  credit: "Insira cada transação de Cartão de crédito",
  debit: "Insira cada transação de Cartão de débito",
  cash: "Insira cada transação em dinheiro",
};
const BUTTONS = {
  pix: "Salvar PIX",
  credit: "Salvar cartão de crédito",
  debit: "Salvar cartão de débito",
  cash: "Salvar dinheiro",
};

const formSchema = z.object({
  transactions: z.array(z.number()),
});

type ReceiptFormProps = {
  type: "pix" | "credit" | "debit" | "cash";
  receipts: z.infer<typeof createCashReceiptsSchema>;
  open: boolean;
  setOpen: (open: boolean) => void;
  computedValue?: number;
  setPixValue?: (v: string) => void;
  setCreditValue?: (v: string) => void;
  setDebitValue?: (v: string) => void;
  setCashValue?: (v: string) => void;
};

export function ReceiptForm({
  type,
  receipts,
  open,
  setOpen,
  computedValue = 0,
  setPixValue,
  setCreditValue,
  setDebitValue,
  setCashValue,
}: ReceiptFormProps) {
  const defaultValues = {
    transactions: receipts.map((receipt) => receipt.value) || [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { mutate: deleteReceipt } = useDeleteCashReceipt();
  const { mutate: createReceipts, isPending: isCreating } =
    useUpsertCashReceipts();

  const [inputValue, setInputValue] = useState("");
  const transactions = form.watch("transactions");
  const totalTransactions = transactions.reduce(
    (acc, curr) => acc + Number(curr),
    0,
  );
  const difference = totalTransactions - computedValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const addTransaction = () => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      form.setValue("transactions", [
        ...form.getValues("transactions"),
        parsedValue,
      ]);
      setInputValue("");
    }
  };

  const removeTransaction = async (index: number, id?: string) => {
    if (id) {
      setDeletingId(id);
      deleteReceipt(id, {
        onSettled: () => setDeletingId(null),
      });
    }
    const updated = [...form.getValues("transactions")];
    updated.splice(index, 1);
    form.setValue("transactions", updated);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const cashReceipts = values.transactions.map((transaction) => ({
      type,
      value: Number(transaction),
      amount: 1,
      total: Number(transaction),
    })) as z.infer<typeof createCashReceiptsSchema>;

    createReceipts(cashReceipts, {
      onSuccess: () => {
        setOpen(false);

        // Atualiza o valor total no query param correspondente
        const total = String(
          values.transactions.reduce((acc, curr) => acc + Number(curr), 0),
        );
        if (type === "pix" && setPixValue) setPixValue(total);
        if (type === "credit" && setCreditValue) setCreditValue(total);
        if (type === "debit" && setDebitValue) setDebitValue(total);
        if (type === "cash" && setCashValue) setCashValue(total);
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="space-y-4 px-0">
        <ScrollArea className="relative h-[calc(100vh_-_48px)] pb-28 px-5">
          <SheetHeader className="items-start mb-4">
            <div className="flex flex-row items-center gap-2">
              <SheetClose
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <ArrowLeft />
              </SheetClose>
              <SheetTitle className="!mt-0">{TITLES[type]}</SheetTitle>
            </div>
            <SheetDescription className="!mt-0">
              {DESCRIPTIONS[type]}
            </SheetDescription>
          </SheetHeader>

          <div className="mb-4">
            <div className="flex flex-row justify-between text-sm">
              <span>Valor computado</span>
              <span>{formatCurrencyBRL(computedValue)}</span>
            </div>
            <div className="flex flex-row justify-between text-sm">
              <span>Transações adicionadas</span>
              <span>{formatCurrencyBRL(totalTransactions)}</span>
            </div>
            <div className="flex flex-row justify-between text-sm">
              <span>Diferença</span>
              <span
                className={
                  difference === 0 ? "text-green-600" : "text-amber-600"
                }
              >
                {formatCurrencyBRL(difference)}
              </span>
            </div>
          </div>

          {transactions.length > 0 && (
            <div className="space-y-2 pb-8">
              {transactions.map((transaction, index) => (
                <Card
                  key={index}
                  className="flex items-center justify-between p-2"
                >
                  <span>{formatCurrencyBRL(transaction)}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={async () =>
                      await removeTransaction(index, receipts[index]?.id)
                    }
                    disabled={
                      !!receipts[index]?.id &&
                      deletingId === receipts[index]?.id
                    }
                  >
                    {receipts[index]?.id &&
                    deletingId === receipts[index]?.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <footer className="absolute bottom-0 right-0 w-full bg-background px-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      ref={inputRef}
                      placeholder="Insira o valor da transação..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTransaction();
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Pressione Enter para adicionar a transação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
                <Button
                  type="button"
                  onClick={() => onSubmit(form.getValues())}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>{BUTTONS[type]}</span>
                    </>
                  ) : (
                    <span>{BUTTONS[type]}</span>
                  )}
                </Button>
              </form>
            </Form>
          </footer>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
