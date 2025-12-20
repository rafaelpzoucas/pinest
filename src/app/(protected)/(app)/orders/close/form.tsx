"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrencyBRL, stringToNumber } from "@/lib/utils";
import { PaymentType } from "@/models/payment";
import { StoreCustomerType } from "@/models/store-customer";
import { useCloseBillStore } from "@/stores/closeBillStore";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closeBills, createPayment } from "./actions";
import { CustomersCombobox } from "./customers/combobox";
import { createPaymentSchema } from "./schemas";
import { ordersKeys } from "@/features/admin/orders/hooks";

export function CloseBillForm({
  payments,
  saleDiscount = 0,
  storeCustomers,
  isPermissionGranted,
}: {
  payments: PaymentType[];
  saleDiscount?: number;
  storeCustomers?: StoreCustomerType[];
  isPermissionGranted: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const tab = searchParams.get("tab");
  const orderId = searchParams.get("order_id");

  const { rowSelection, setRowSelection, items, updateItemPayment } =
    useCloseBillStore();

  const [enterAmount, setEnterAmount] = useState("");
  const customerFormSheetState = useState(false);

  const selectedItems = items.filter((_, index) => rowSelection[index]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof createPaymentSchema>>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: "",
      discount: "",
      status: "confirmed",
      table_id: searchParams.get("table_id") ?? undefined,
      order_id: orderId ?? undefined,
    },
  });

  // Cálculos principais
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  );

  const totalSelectedAmount = selectedItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0,
  );

  // Descontos já aplicados anteriormente
  const previousTotalDiscount =
    payments.reduce((sum, item) => sum + (item.discount || 0), 0) +
    saleDiscount;

  // Desconto do pagamento atual
  const currentDiscount = stringToNumber(form.watch("discount")) || 0;

  // Total de descontos (anteriores + atual)
  const totalDiscount = previousTotalDiscount + currentDiscount;

  // Total já pago anteriormente
  const totalAmountPaid = payments.reduce((sum, item) => sum + item.amount, 0);

  // Valor restante ANTES do desconto atual (para cálculos internos)
  const remainingBeforeCurrentDiscount =
    totalAmount - previousTotalDiscount - totalAmountPaid;

  // Valor restante a pagar DEPOIS do desconto atual (para exibição)
  const remainingAmount = remainingBeforeCurrentDiscount - currentDiscount;

  const isCashPayment = form.watch("payment_type") === "CASH";
  const isDeferredPayment = form.watch("payment_type") === "DEFERRED";

  const amount = stringToNumber(form.watch("amount")) || 0;
  const amountToPay = amount;

  // Verifica se fecha a venda: valor a pagar >= valor restante (já considerando desconto)
  const isCloseBill = amountToPay >= remainingAmount;

  const changeAmount = stringToNumber(enterAmount) - amountToPay;

  // Mutation para criar pagamento
  const createPaymentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createPaymentSchema>) => {
      const [data, error] = await createPayment(values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas aos pedidos
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.open });

      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
      }

      router.refresh();
    },
    onError: (error) => {
      console.error("Error ao salvar pagamento:", error);
    },
  });

  // Mutation para fechar venda
  const closeBillMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createPaymentSchema>) => {
      const [data, error] = await closeBills(values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas aos pedidos
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.open });

      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
      }

      router.push(`/orders?tab=${tab}`);
    },
    onError: (error) => {
      console.error("Error ao fechar venda:", error);
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createPaymentSchema>) {
    try {
      // Cria o pagamento
      await createPaymentMutation.mutateAsync(values);

      // Atualiza status dos itens pagos
      values?.items?.forEach((item) => {
        updateItemPayment(item.id, true);
      });

      // Se deve fechar a venda, executa o fechamento
      if (isCloseBill) {
        await closeBillMutation.mutateAsync(values);
      } else {
        // Se não fechar, apenas reseta o formulário
        form.reset();
        setEnterAmount("");
        setRowSelection({});
      }
    } catch (error) {
      console.error("Error ao processar pagamento:", error);
    }
  }

  // Atualiza o valor a receber quando seleciona itens ou aplica desconto
  useEffect(() => {
    const selectedAmount =
      totalSelectedAmount > remainingBeforeCurrentDiscount
        ? remainingBeforeCurrentDiscount
        : totalSelectedAmount;

    // Aplica o desconto atual ao valor selecionado
    const amountWithDiscount = Math.max(0, selectedAmount - currentDiscount);

    form.setValue("amount", amountWithDiscount.toString());
    form.setValue(
      "items",
      selectedItems.map((item) => ({ id: item.id })),
    );
  }, [totalSelectedAmount, currentDiscount, remainingBeforeCurrentDiscount]);

  const isLoading =
    createPaymentMutation.isPending || closeBillMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <Card className="space-y-6 p-4">
          <h1 className="text-lg font-bold">Resumo do pagamento</h1>

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto</FormLabel>
                <FormControl>
                  <Input
                    maskType="currency"
                    placeholder="Insira o valor do desconto..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Desconto aplicado neste pagamento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receber</FormLabel>
                <FormControl>
                  <Input
                    maskType="currency"
                    placeholder="Insira o valor a receber..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>Valor após aplicar o desconto</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => <Input type="hidden" {...field} />}
          />

          <FormField
            control={form.control}
            name="payment_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Forma de pagamento</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="PIX" />
                      </FormControl>
                      <FormLabel className="font-normal">PIX</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="CREDIT" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Cartão de crédito
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="CASH" />
                      </FormControl>
                      <FormLabel className="font-normal">Dinheiro</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="DEBIT" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Cartão de débito
                      </FormLabel>
                    </FormItem>

                    {isPermissionGranted && (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="DEFERRED" />
                        </FormControl>
                        <FormLabel className="font-normal">A Prazo</FormLabel>
                      </FormItem>
                    )}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isCashPayment && (
            <div>
              <FormItem>
                <Label>Valor recebido (opcional)</Label>
                <Input
                  maskType="currency"
                  placeholder="Insira o valor pago..."
                  value={enterAmount}
                  onChange={(e) => setEnterAmount(e.target.value)}
                />
                <FormDescription>
                  Para calcular o valor do troco
                </FormDescription>
              </FormItem>

              {stringToNumber(enterAmount) > 0 && (
                <div className="flex flex-row items-center justify-between py-2">
                  <p>Valor do troco:</p>
                  <strong>
                    {formatCurrencyBRL(changeAmount > 0 ? changeAmount : 0)}
                  </strong>
                </div>
              )}
            </div>
          )}

          {isDeferredPayment && (
            <CustomersCombobox
              storeCustomers={storeCustomers}
              form={form}
              customerFormSheetState={customerFormSheetState}
            />
          )}

          <header className="flex-1 text-sm text-muted-foreground border-t pt-4 space-y-2">
            <div className="space-y-1">
              <div className="flex flex-row items-center justify-between w-full">
                <span>Total</span>
                <strong>{formatCurrencyBRL(totalAmount)}</strong>
              </div>
              <div className="flex flex-row items-center justify-between w-full text-red-600">
                <span>Descontos aplicados</span>
                <strong>- {formatCurrencyBRL(totalDiscount)}</strong>
              </div>
              <div className="flex flex-row items-center justify-between w-full text-green-600">
                <span>Total pago</span>
                <strong>- {formatCurrencyBRL(totalAmountPaid)}</strong>
              </div>
              <div
                className="flex flex-row items-center justify-between w-full pt-2 border-t text-base
                  font-semibold text-foreground"
              >
                <span>Restante a pagar</span>
                <strong>{formatCurrencyBRL(remainingAmount)}</strong>
              </div>
            </div>
          </header>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || amountToPay === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>
                  Confirmando pagamento {isCloseBill ? "e fechando" : ""}
                </span>
              </>
            ) : (
              <span>
                {isCloseBill
                  ? "Confirmar e fechar venda"
                  : "Confirmar pagamento"}
              </span>
            )}
          </Button>
        </Card>
      </form>
    </Form>
  );
}
