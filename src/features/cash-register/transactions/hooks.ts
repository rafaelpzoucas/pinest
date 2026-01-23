"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCashSessionTransaction } from "./create";
import { toast } from "sonner";
import { readPaymentsByCashSessionId } from "./read-by-id";
import { CreateCashSessionTransactionType } from "../schemas";

// Query Keys
export const cashSessionKeys = {
  all: ["cash-sessions"] as const,
  current: ["cash-sessions", "current"] as const,
  payments: ["cash-sessions", "payments"] as const,
};

// Hook para criar transação na sessão de caixa
export const useCreateCashSessionTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCashSessionTransactionType) => {
      const [data, error] = await createCashSessionTransaction(input);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Transação criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.payments });
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.current });
    },
    onError: (error) => {
      console.error("Erro ao criar transação:", error);
      toast.error("Erro ao criar transação. Tente novamente.");
    },
  });
};

// Hook para ler pagamentos da sessão de caixa atual
export const useReadCashSessionPayments = (cashSessionId?: string) => {
  return useQuery({
    queryKey: [...cashSessionKeys.payments, cashSessionId],
    enabled: !!cashSessionId,
    queryFn: async () => {
      const start = performance.now();
      console.log("[payments] 🔄 fetch start");

      const [data, error] = await readPaymentsByCashSessionId({
        cashSessionId: cashSessionId!,
      });

      const end = performance.now();
      console.log(`[payments] ✅ fetch end - ${(end - start).toFixed(2)}ms`);

      if (error) {
        console.error("[payments] ❌ error", error);
        throw error;
      }

      return data?.payments || [];
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Hook para ler pagamentos por ID da sessão de caixa
export const useReadPaymentsByCashSessionId = (cashSessionId: string) => {
  return useQuery({
    queryKey: [...cashSessionKeys.all, "payments", cashSessionId] as const,
    queryFn: async () => {
      const [data, error] = await readPaymentsByCashSessionId({
        cashSessionId,
      });

      if (error) {
        throw error;
      }

      return data?.payments || [];
    },
    enabled: !!cashSessionId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};
