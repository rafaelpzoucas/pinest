"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readOpenTables } from "./read-open";
import { cancelTable } from "./cancel";
import { toast } from "sonner";
import { Table } from "./schemas";

export const tablesKeys = {
  all: ["tables"] as const,
  open: ["tables", "open"] as const,
};

export const useReadOpenTables = () => {
  return useQuery({
    queryKey: tablesKeys.open,
    queryFn: async () => {
      const [data, error] = await readOpenTables();

      if (error) {
        throw error;
      }

      return (data?.openTables as Table[]) || [];
    },
    staleTime: 1000 * 30, // 30 segundos (dados que mudam frequentemente)
    refetchInterval: 1000 * 60, // Refetch a cada 1 minuto
  });
};

interface UseCancelTableOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCancelTable = (options?: UseCancelTableOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tableId: string) => {
      const [data, error] = await cancelTable({ tableId });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas a tables
      queryClient.invalidateQueries({ queryKey: tablesKeys.all, exact: false });

      toast.success("Mesa cancelada com sucesso");

      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar mesa");

      options?.onError?.(error);
    },
  });
};
