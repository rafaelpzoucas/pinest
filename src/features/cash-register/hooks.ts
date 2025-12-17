"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCashSession } from "./create-session";
import { closeCashSession } from "./close-session";
import { readCashSession } from "./read";

// Query Keys
export const cashSessionKeys = {
  all: ["cash-sessions"] as const,
  current: ["cash-sessions", "current"] as const,
};

// Hook para ler a sessão de caixa atual
export const useReadCashSession = () => {
  return useQuery({
    queryKey: cashSessionKeys.current,
    queryFn: async () => {
      const [data, error] = await readCashSession();

      if (error) {
        throw error;
      }

      return data?.cashSession;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para criar sessão de caixa
export const useCreateCashSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { opening_balance: string }) => {
      const [data, error] = await createCashSession(input);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Caixa aberto com sucesso!");
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.all });
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.current });
    },
    onError: (error) => {
      console.error("Erro ao abrir caixa:", error);
      toast.error("Erro ao abrir caixa. Tente novamente.");
    },
  });
};

// Hook para fechar sessão de caixa
export const useCloseCashSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      closing_balance: string;
      cash_balance: string;
      credit_balance: string;
      debit_balance: string;
      pix_balance: string;
    }) => {
      const [data, error] = await closeCashSession(input);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Caixa fechado com sucesso!");
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.all });
      queryClient.invalidateQueries({ queryKey: cashSessionKeys.current });
    },
    onError: (error) => {
      console.error("Erro ao fechar caixa:", error);
      toast.error("Erro ao fechar caixa. Tente novamente.");
    },
  });
};
