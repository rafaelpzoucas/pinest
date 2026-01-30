"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { useCashRegister } from "@/stores/cashRegisterStore";
import {
  BadgeDollarSign,
  CheckCircle,
  CreditCard,
  Loader2,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { closeBills, createPayment } from "../../close/actions";
import { useQueryState } from "nuqs";
import { OpenCashSession } from "../../../cash-register/open";
import { Order, PaymentType } from "@/features/admin/orders/schemas";
import { PAYMENT_TYPES } from "@/models/order";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersKeys } from "@/features/admin/orders/hooks";
import { tablesKeys } from "@/features/tables/hooks";
import { useRouter } from "next/navigation";
import {
  RadioButtonGroup,
  RadioButtonGroupItem,
} from "@/components/ui/radio-button-group";
import { useState } from "react";

type CloseSaleButtonProps = {
  order: Order;
};

export function CloseSaleButton({ order }: CloseSaleButtonProps) {
  const [tab] = useQueryState("tab");
  const { isCashOpen } = useCashRegister();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cardType, setCardType] = useState<PaymentType | "">("");

  // Mutation para criar pagamento
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const [data, error] = await createPayment({
        amount: order?.total?.total_amount.toString() ?? "0",
        payment_type:
          order.payment_type === "CARD"
            ? cardType || "PAID"
            : (order.payment_type ?? "PAID"),
        status: "confirmed",
        order_id: order.id,
        discount: "0",
      });
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Erro ao criar pagamento:", error);
    },
  });

  // Mutation para fechar venda
  const closeBillMutation = useMutation({
    mutationFn: async () => {
      const [data, error] = await closeBills({ order_id: order.id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.open });
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: tablesKeys.open });

      router.push(`/orders?tab=${tab ?? "deliveries"}`);
    },
    onError: (error) => {
      console.error("Erro ao fechar venda:", error);
    },
  });

  const handleCardTypeChange = (value: string) => {
    setCardType(value as PaymentType | "");
  };

  const isLoading =
    createPaymentMutation.isPending || closeBillMutation.isPending;

  // Early returns para melhor legibilidade
  const shouldShowButton =
    order.status !== "pending" &&
    order.status === "delivered" &&
    !order.is_paid;

  if (!shouldShowButton) {
    return null;
  }

  if (!isCashOpen) {
    return <OpenCashSession />;
  }

  const paymentType = order.payment_type
    ? PAYMENT_TYPES[order.payment_type as keyof typeof PAYMENT_TYPES]
    : "Não informado";

  const closeUrl = `/orders/close?order_id=${order.id}&tab=${tab ?? "deliveries"}`;

  const handleConfirmClose = async () => {
    try {
      // Primeiro cria o pagamento
      await createPaymentMutation.mutateAsync();
      // Depois fecha a venda
      await closeBillMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao processar fechamento:", error);
    }
  };

  const disabled = isLoading || (order.payment_type === "CARD" && !cardType);

  // Pedidos iFood têm fluxo simplificado (sem confirmação)
  if (order.is_ifood) {
    return (
      <Button onClick={handleConfirmClose} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Fechando venda...</span>
          </>
        ) : (
          <>
            <BadgeDollarSign className="h-5 w-5" />
            <span>Fechar venda</span>
          </>
        )}
      </Button>
    );
  }

  // Pedidos normais têm confirmação com opção de editar pagamento
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <BadgeDollarSign className="h-5 w-5" />
              <span>Fechar venda</span>
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar fechamento da venda</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>Você está prestes a fechar esta venda.</p>
              <p className="font-medium text-foreground">
                <Badge variant="secondary" className="text-lg">
                  {paymentType}
                </Badge>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {order.payment_type === "CARD" && (
          <div className="flex flex-col items-center gap-4 p-4 bg-secondary/50 rounded-md">
            <p>Escolha a forma de pagamento no cartão:</p>

            <RadioButtonGroup
              value={cardType}
              onValueChange={handleCardTypeChange}
              orientation="horizontal"
              className="flex-wrap"
            >
              <RadioButtonGroupItem value="CREDIT_CARD">
                <CreditCard />
                Crédito
              </RadioButtonGroupItem>
              <RadioButtonGroupItem value="DEBIT_CARD">
                <CreditCard />
                Débito
              </RadioButtonGroupItem>
            </RadioButtonGroup>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Link
            href={closeUrl}
            className={buttonVariants({ variant: "outline" })}
            aria-label="Alterar forma de pagamento"
          >
            <SquarePen className="h-4 w-4" />
            <span>Alterar pagamento</span>
          </Link>

          <Button onClick={handleConfirmClose} disabled={disabled}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fechando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Confirmar</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
