"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { readCashReceipts } from "./read";
import { deleteCashReceipt } from "./delete";
import { upsertCashReceipts } from "../upsert-cash-receipts";

// Query Keys
export const cashReceiptsKeys = {
  all: ["cash-receipts"] as const,
  current: ["cash-receipts", "current"] as const,
};

// ✅ Hook para ler recibos da sessão de caixa atual
export const useReadCashReceipts = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: cashReceiptsKeys.current,
    queryFn: async () => {
      const [data, error] = await readCashReceipts();

      if (error) {
        throw error;
      }

      return data?.cashReceipts || [];
    },
    enabled: options?.enabled ?? true, // 👈 Aceita enabled como parâmetro
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

export const useUpsertCashReceipts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receipts: any[]) => {
      const [data, error] = await upsertCashReceipts(receipts);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Recibos salvos com sucesso!");
      queryClient.invalidateQueries({ queryKey: cashReceiptsKeys.all });
      queryClient.invalidateQueries({ queryKey: cashReceiptsKeys.current });
    },
    onError: (error) => {
      console.error("Erro ao salvar recibos:", error);
      toast.error("Erro ao salvar recibos. Tente novamente.");
    },
  });
};

// Hook para deletar recibo
export const useDeleteCashReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const [data, error] = await deleteCashReceipt({ id });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Recibo removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: cashReceiptsKeys.all });
      queryClient.invalidateQueries({ queryKey: cashReceiptsKeys.current });
    },
    onError: (error) => {
      console.error("Erro ao remover recibo:", error);
      toast.error("Erro ao remover recibo. Tente novamente.");
    },
  });
};
